import { NextRequest, NextResponse } from "next/server";

// GitHub issue URL pattern
const GITHUB_ISSUE_PATTERN = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;

interface GitHubIssue {
  title: string;
  body: string;
  state: string;
  labels: { name: string }[];
  user: { login: string };
  created_at: string;
  comments: number;
}

interface GitHubComment {
  user: { login: string };
  body: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Check if it's a GitHub issue
    const githubMatch = url.match(GITHUB_ISSUE_PATTERN);
    if (githubMatch) {
      const [, owner, repo, issueNumber] = githubMatch;
      return await fetchGitHubIssue(owner, repo, issueNumber);
    }

    // For other URLs, fetch as webpage
    return await fetchWebpage(url);
  } catch (error) {
    console.error("Fetch URL error:", error);
    return NextResponse.json(
      { error: "Failed to fetch URL content" },
      { status: 500 }
    );
  }
}

async function fetchGitHubIssue(owner: string, repo: string, issueNumber: string) {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "TellAI-App",
    };

    // Add GitHub token if available for higher rate limits
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch issue details
    const issueResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
      { headers }
    );

    if (!issueResponse.ok) {
      if (issueResponse.status === 404) {
        return NextResponse.json({ error: "GitHub issue not found" }, { status: 404 });
      }
      throw new Error(`GitHub API error: ${issueResponse.status}`);
    }

    const issue: GitHubIssue = await issueResponse.json();

    // Fetch comments if there are any (limit to first 10)
    let comments: GitHubComment[] = [];
    if (issue.comments > 0) {
      const commentsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=10`,
        { headers }
      );
      if (commentsResponse.ok) {
        comments = await commentsResponse.json();
      }
    }

    // Format the issue content
    const labels = issue.labels.map((l) => l.name).join(", ");
    let content = `# GitHub Issue #${issueNumber}: ${issue.title}

**Repository:** ${owner}/${repo}
**Status:** ${issue.state}
**Author:** @${issue.user.login}
**Created:** ${new Date(issue.created_at).toLocaleDateString()}
${labels ? `**Labels:** ${labels}` : ""}

## Description
${issue.body || "No description provided."}
`;

    if (comments.length > 0) {
      content += `\n## Comments (${Math.min(comments.length, 10)} of ${issue.comments})\n`;
      for (const comment of comments) {
        content += `\n### @${comment.user.login} (${new Date(comment.created_at).toLocaleDateString()})
${comment.body}
`;
      }
    }

    return NextResponse.json({
      type: "github_issue",
      title: `#${issueNumber}: ${issue.title}`,
      content,
      metadata: {
        owner,
        repo,
        issueNumber,
        state: issue.state,
        labels: issue.labels.map((l) => l.name),
      },
    });
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub issue" },
      { status: 500 }
    );
  }
}

async function fetchWebpage(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "TellClaude-App/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";

    // Handle text-based content
    if (contentType.includes("text/") || contentType.includes("application/json")) {
      const text = await response.text();

      // For HTML, try to extract main content
      if (contentType.includes("text/html")) {
        // Simple HTML to text conversion - strip tags
        const textContent = text
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 15000); // Limit content length

        // Try to extract title
        const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;

        return NextResponse.json({
          type: "webpage",
          title,
          content: textContent,
          url,
        });
      }

      // For JSON or plain text
      return NextResponse.json({
        type: "text",
        title: new URL(url).pathname.split("/").pop() || "Content",
        content: text.slice(0, 15000),
        url,
      });
    }

    return NextResponse.json(
      { error: "Unsupported content type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Webpage fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch webpage" },
      { status: 500 }
    );
  }
}
