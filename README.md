# TellClaude

> Voice to Perfect Prompt - Transform your spoken thoughts into well-structured prompts for Claude Code.

![TellClaude](https://img.shields.io/badge/TellClaude-Voice%20to%20Prompt-ff6b35?style=for-the-badge)

## Features

- **Voice Recording** - Speak your thoughts using the Web Speech API
- **10 Prompt Modes** - Code, Planning, Brainstorming, Design, Feedback, Technical, Debug, Review, Docs, Refactor
- **12 Modifiers** - Step-by-step, Examples, Alternatives, Best Practices, Edge Cases, Performance, Security, Testing, and more
- **Detail Levels** - Concise, Balanced, or Comprehensive
- **Output Formats** - Structured, Conversational, or Bullet Points
- **Interview Mode** - AI-powered prompt refinement using OpenRouter
- **One-Click Copy** - Copy your generated prompt directly to clipboard

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Web Speech API** - Browser-native voice recognition
- **Vercel AI SDK** - For interview mode
- **OpenRouter** - AI model access for interviews

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/TellClaude.git
cd TellClaude

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Add your OpenRouter API key (optional, for Interview Mode)
# Edit .env.local and add: OPENROUTER_API_KEY=your_key_here

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Optional | OpenRouter API key for Interview Mode |

## Usage

1. **Record** - Click the microphone to speak your request
2. **Select Mode** - Choose the type of task (Code, Planning, etc.)
3. **Add Modifiers** - Check options like "Include Examples" or "Best Practices"
4. **Adjust Settings** - Set detail level and output format
5. **Generate** - Click "Generate Prompt" for instant results
6. **Interview** (Optional) - Use AI to refine your prompt with clarifying questions
7. **Copy** - One click to copy and paste into Claude Code

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/TellClaude)

## License

MIT License - feel free to use this project for any purpose.

---

Built with love for the Claude Code community.
