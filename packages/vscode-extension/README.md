# GitSpeak — Natural language Git for VS Code

Describe what you want to do with Git in plain language, get the right command, and run it — all without leaving your editor.

## Features

- **Natural language → Git command**: Type "undo last commit without losing changes" and get the exact command with a full explanation.
- **Fix my repo**: Paste `git status` output and describe your problem; GitSpeak diagnoses it and suggests a step-by-step recovery plan ordered by risk level.
- **Run in terminal**: Execute commands directly from VS Code with safety prompts for destructive operations.
- **Automatic Git context**: Detects your active branch, last commit, and repo status so every command is tailored to your current state.
- **AI Gateway**: Connects to the same intelligent routing backend as the web app — your active model preference carries over automatically.

## Installation

### From the VS Code Marketplace (recommended)

1. Open VS Code.
2. Go to **Extensions** (`Cmd+Shift+X` / `Ctrl+Shift+X`).
3. Search for **GitSpeak**.
4. Click **Install**.

### Manual install via VSIX

1. Download the latest `.vsix` from the [Releases](https://github.com/ZIVELO-MX/prompt2git/releases) page.
2. Open VS Code → Extensions panel → `···` menu → **Install from VSIX…**
3. Select the downloaded file.

## First-time login

On first use GitSpeak will open your browser at `https://www.prompt2git.com/login`.  
After logging in, your session token is saved in VS Code's Secret Storage — you won't need to log in again.

## Usage

1. Press `Cmd+Shift+G` (macOS) / `Ctrl+Shift+G` (Windows/Linux) to open GitSpeak.
2. Type what you want to do in natural language (or switch to **Fix my repo** mode).
3. Review the command and explanation, then click **Run in terminal**.

## AI models

The extension calls the same `/api/generate` endpoint as the web app, so it goes through the AI Gateway automatically.

| Plan | Model | Notes |
|------|-------|-------|
| **Starter** | Llama 3.1 8B (OpenRouter) | Fixed — no selection needed |
| **Pro** | Your choice from 6 free models | Set your preferred model on the web app; the extension uses it automatically |
| **Pro + BYOK** | Your configured API key | Full control — any supported provider |

To switch models, open the web app at [prompt2git.com](https://www.prompt2git.com), select your model next to the Generate button, and the extension will pick it up on the next request.

## Requirements

- VS Code 1.96+
- An active internet connection (calls the GitSpeak API)
- A GitSpeak account — free at [prompt2git.com](https://www.prompt2git.com)

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `gitspeak.apiUrl` | `https://www.prompt2git.com` | Base URL for the GitSpeak API server |

## Publishing

### Prerequisites

1. Install the VS Code Extension Manager:
   ```bash
   npm install -g @vscode/vsce
   ```

2. Create a publisher on the [VS Code Marketplace](https://marketplace.visualstudio.com/manage).

3. Generate a Personal Access Token and log in:
   ```bash
   vsce login zivelo
   ```

### Build & Package

```bash
cd packages/vscode-extension
npm run build           # production build
npm run package         # generates dist/gitspeak.vsix
```

### Publish

```bash
vsce publish
# Or bump version and publish:
vsce publish patch     # 0.1.0 → 0.1.1
vsce publish minor     # 0.1.0 → 0.2.0
vsce publish major     # 0.1.0 → 1.0.0
```

## Local Development

```bash
cd packages/vscode-extension
npm install
npm run dev            # watch mode (rebuilds on changes)
```

Press `F5` in VS Code to launch the Extension Development Host.

## License

MIT
