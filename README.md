# 🧠 AI Scratchpad

> ⚠️ **Work in Progress**: This project is currently under development and not thoroughly tested. Features may be incomplete, unstable, or subject to significant changes. Use at your own discretion and expect potential bugs or data loss.

A clean, minimal desktop application for intelligent note-taking powered by AI. Built with Tauri + Vue 3 for a native desktop experience with modern web technologies.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20|%20Windows%20|%20Linux-lightgrey.svg)
![Vue](https://img.shields.io/badge/Vue-3.5.13-4FC08D.svg)
![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC131.svg)

## ✨ Features

### 📝 Rich Text Editing
- **Visual WYSIWYG Editor** - Vue Quill with professional formatting tools
- **Syntax Highlighting** - Automatic code block highlighting with highlight.js
- **Rich Formatting** - Bold, italic, headers, lists, quotes, and code blocks
- **Table Support** - Enhanced table editing capabilities

### 🤖 AI-Powered Processing
- **Text Selection Processing** - Select any text and transform it with AI
  - 📝 **Summarize** - Condense text into key points
  - 🔸 **Bullet Points** - Convert to structured bullet lists
  - 🔄 **Replace Mode** - Replace selected text with AI output
- **OpenRouter Integration** - Access to multiple AI models via OpenRouter API
- **Secure API Storage** - Encrypted API key storage using Tauri store

### 💾 Data Management
- **Auto-Save** - Intelligent debounced saving (1-second delay)
- **Dual Storage Mode** - Works as desktop app or web browser application
- **Persistent Storage** - Desktop: App data directory | Browser: LocalStorage
- **Cross-Session Persistence** - Your notes survive app restarts

### 🎨 User Experience
- **Clean Interface** - Minimal, distraction-free writing experience
- **Dark/Light Mode** - Adaptive theming with system preference detection
- **Toast Notifications** - Non-intrusive status and error messages
- **Settings Panel** - Configurable preferences and API settings
- **Cross-Platform** - Native desktop app for macOS, Windows, and Linux

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- [Rust](https://rustup.rs/) - Required for Tauri backend compilation
- [OpenRouter API Key](https://openrouter.ai/) - For AI text processing features

### System Requirements

**Desktop Application:**
- **macOS**: 10.15+ (Catalina or later)
- **Windows**: Windows 10 version 1903+ (build 18362+)
- **Linux**: Ubuntu 18.04+, Debian 10+, or equivalent
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB for application, additional space for notes

**Browser Mode:**
- Modern browser with ES2018+ support (Chrome 70+, Firefox 65+, Safari 12+)
- LocalStorage support for data persistence
- Internet connection for AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/danjdewhurst/ai-scratchpad.git
cd ai-scratchpad

# Install dependencies
bun install

# Run in development mode
bun run tauri dev
```

### Building

```bash
# Build for production
bun run tauri build
```

## 🔧 Configuration

### Initial Setup
1. **Launch Application**: Start the app via `bun run tauri dev` or install the built version
2. **API Key Setup**: Click the settings gear icon (⚙️) to open the configuration panel
3. **Enter OpenRouter Key**: Paste your OpenRouter API key and save
4. **Theme Selection**: Choose between light/dark mode or use system preference

### Advanced Configuration
- **AI Model**: Default model is `openai/gpt-4.1-nano` (optimized for speed and cost)
- **Base URL**: OpenRouter endpoint `https://openrouter.ai/api/v1` (pre-configured)
- **Auto-Save**: 1-second debounced saving (automatic, not configurable)
- **Replace Mode**: Toggle whether AI output replaces selected text or inserts after

### Data Storage Locations

**Desktop Mode:**
- **macOS**: `~/Library/Application Support/com.ai-scratchpad.app/note.html`
- **Windows**: `%APPDATA%\com.ai-scratchpad.app\note.html`
- **Linux**: `~/.local/share/com.ai-scratchpad.app/note.html`

**Browser Mode:**
- **Storage**: Browser LocalStorage under key `ai-scratchpad-content`
- **Backup**: Export your content manually (copy from editor)

### Environment Variables

```bash
# Optional: Set default OpenRouter API key
OPENROUTER_API_KEY=your_api_key_here

# Development: Override default ports
VITE_PORT=1420
TAURI_DEV_PORT=1420
```

## 🛠️ Tech Stack

### Frontend Framework
- **Vue 3.5.13** + **TypeScript 5.6** - Modern reactive UI framework
- **Vite 6.0** - Lightning-fast build tool and dev server
- **Vue Composition API** - Reactive state management

### Rich Text Editing
- **Vue Quill 1.2.0** - Professional WYSIWYG editor for Vue 3
- **Quill Better Table** - Enhanced table editing capabilities
- **Highlight.js 11.11** - Syntax highlighting for code blocks

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS** - CSS processing and optimization
- **Responsive Design** - Mobile-friendly layouts

### Desktop Framework
- **Tauri 2.x** - Rust-based secure desktop app framework
- **Tauri Filesystem Plugin** - Secure file system access
- **Tauri Store Plugin** - Encrypted settings storage
- **Tauri Opener Plugin** - External link handling

### AI Integration
- **OpenRouter API** - Access to 100+ AI models
- **OpenAI SDK 5.10** - Standard API interface with TypeScript support
- **Default Model**: `openai/gpt-4.1-nano` - Optimized for performance and cost

### Development Tools
- **Bun** - Fast JavaScript runtime and package manager
- **TypeScript** - Type-safe development
- **Vue TSC** - Vue-specific TypeScript compiler
- **Autoprefixer** - Automatic CSS vendor prefixing

## 📁 Project Structure

```
ai-scratchpad/
├── src/                      # Vue 3 Frontend
│   ├── App.vue              # Main application component (editor, AI, UI)
│   ├── main.ts              # Vue app initialization
│   ├── style.css            # Global Tailwind CSS styles
│   ├── services/            # Business logic services
│   │   └── openrouter.ts    # OpenRouter API integration
│   └── vite-env.d.ts        # TypeScript environment declarations
│
├── src-tauri/               # Rust Backend (Tauri)
│   ├── src/
│   │   ├── main.rs          # Tauri application entry point
│   │   └── lib.rs           # Rust library code
│   ├── tauri.conf.json      # App configuration & permissions
│   ├── Cargo.toml           # Rust dependencies
│   ├── build.rs             # Build script
│   ├── capabilities/        # Tauri security capabilities
│   └── icons/               # Application icons (all platforms)
│
├── dist/                    # Built Vue application (generated)
├── public/                  # Static assets
├── node_modules/           # NPM dependencies
│
├── package.json            # Node.js dependencies & scripts
├── bun.lock               # Bun lockfile
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
│
├── CLAUDE.md              # AI assistant instructions
├── PLAN.md                # Development roadmap & phases
├── README.md              # This file
└── LICENSE                # MIT license
```

## 🎯 Development Status

- ✅ **Phase 1** - Cleanup & Foundation
- ✅ **Phase 2** - Core Editor Implementation  
- ✅ **Phase 3** - Data Persistence
- ✅ **Phase 4** - AI Integration Setup
- ✅ **Phase 5** - Text Processing Features
- ✅ **Phase 6** - UI/UX Polish
- 🔄 **Phase 7** - Testing & Refinement

## 🔑 Available Scripts

### Development
```bash
bun run dev          # Start Vite development server (browser mode)
bun run tauri dev    # Run Tauri in development mode (desktop app)
```

### Building
```bash
bun run build        # Build Vue app for production
bun run tauri build  # Build Tauri desktop application
bun run preview      # Preview production build locally
```

### Maintenance
```bash
bun install          # Install all dependencies
bun update           # Update dependencies to latest versions
bun run tauri info   # Display Tauri environment information
```

### Testing
```bash
# Run the application in different modes to test:
bun run dev          # Test browser functionality
bun run tauri dev    # Test desktop functionality
# Manual testing of AI features, auto-save, theme switching
```

## 📖 Usage Guide

### Getting Started
1. **Launch**: Start the application using `bun run tauri dev` or the installed desktop app
2. **First Time Setup**: Configure your OpenRouter API key in Settings (⚙️ icon)
3. **Start Writing**: Click in the editor and begin typing your notes
4. **Auto-Save**: Your content is automatically saved every second after changes

### Using AI Features
1. **Select Text**: Highlight any text in the editor
2. **Open AI Menu**: Press `Ctrl/Cmd + Shift + P` or right-click selected text
3. **Choose Action**:
   - **Summarize**: Condense text into key points
   - **Bullet Points**: Convert to structured bullet list
4. **Replace or Insert**: Toggle replace mode in settings to control output behavior

### Editor Features
- **Rich Formatting**: Use toolbar or keyboard shortcuts for bold, italic, headers, lists
- **Code Blocks**: Add syntax-highlighted code with the code block button
- **Tables**: Insert and edit tables using the enhanced table tools
- **Dark/Light Mode**: Toggle theme in settings or it will follow system preference

### Data Management
- **Desktop App**: Data stored in system app directory (see Configuration section)
- **Browser Mode**: Data stored in browser LocalStorage
- **Backup**: Copy content from editor to backup your notes manually
- **Migration**: Copy content between browser and desktop modes as needed

## 🔒 Security & Privacy

### API Key Security
- **Encryption**: API keys are encrypted using Tauri's secure store plugin
- **Local Storage**: Keys never leave your device except for API calls
- **No Telemetry**: No usage data or content is collected or transmitted

### Data Privacy
- **Local First**: All notes stored locally on your device
- **AI Processing**: Selected text sent to OpenRouter/AI models only when explicitly requested
- **No Cloud Sync**: No automatic cloud synchronization or data sharing
- **Open Source**: Full source code available for security auditing

### Network Security
- **HTTPS Only**: All AI API calls use encrypted HTTPS connections
- **Minimal Permissions**: Tauri app requests only necessary system permissions
- **Sandboxed**: Application runs in Tauri's security sandbox

## 🐛 Troubleshooting

### Common Issues

**🔴 "API Key not configured" error**
- Solution: Open Settings (⚙️) and enter your OpenRouter API key
- Verify: Ensure key starts with `sk-` and is valid

**🔴 Auto-save not working**
- Desktop: Check file permissions in app data directory
- Browser: Verify LocalStorage is enabled and not full
- Solution: Try manual save with `Ctrl/Cmd + S`

**🔴 AI processing fails**
- Check internet connection
- Verify API key is valid and has credits
- Check OpenRouter service status at https://openrouter.ai/

**🔴 Application won't start**
- Ensure all prerequisites are installed (Bun, Rust)
- Try: `bun install` to reinstall dependencies
- Check: `bun run tauri info` for environment issues

**🔴 Dark mode not working**
- Clear browser cache if using browser mode
- Reset theme: Delete `theme` key from localStorage
- Restart application

### Getting Help
- **Issues**: Report bugs at [GitHub Issues](https://github.com/danjdewhurst/ai-scratchpad/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/danjdewhurst/ai-scratchpad/discussions)
- **Documentation**: Check [PLAN.md](PLAN.md) for development details

## 🚀 Roadmap & Future Plans

See [PLAN.md](PLAN.md) for detailed development phases and progress.

### Completed ✅
- Rich text editor with Vue Quill
- AI text processing (summarize, bullet points)
- Auto-save and data persistence
- Dark/light theme support
- Cross-platform desktop app
- Secure API key storage

### Planned 🔮
- Additional AI processing modes (expand, improve, translate)
- Export to multiple formats (MD, PDF, HTML)
- Plugin system for custom AI prompts
- Real-time collaboration features
- Mobile companion app
- Cloud sync options (optional)

## ❓ FAQ

**Q: Is my data safe and private?**
A: Yes, all notes are stored locally on your device. AI processing only sends selected text when you explicitly request it.

**Q: Can I use this without an API key?**
A: The editor works fully without an API key, but AI features require OpenRouter access.

**Q: What AI models are supported?**
A: Any model available through OpenRouter. Default is `openai/gpt-4.1-nano` for optimal speed and cost.

**Q: Can I export my notes?**
A: Currently, you can copy content from the editor. Dedicated export features are planned.

**Q: Does this work offline?**
A: The editor works offline, but AI features require internet connection.

**Q: Can I customize the AI prompts?**
A: Not currently, but custom prompts are planned for future releases.

**Q: Is there a mobile version?**
A: Not yet, but mobile support is being considered for future development.

## 🎯 Performance

### System Impact
- **Memory Usage**: ~50-100MB RAM (typical)
- **CPU Usage**: Minimal when idle, brief spikes during AI processing
- **Storage**: ~50MB app size, notes size varies
- **Network**: Only during AI API calls (selected text only)

### Optimization Features
- **Debounced Auto-save**: Reduces file system calls
- **Lazy Loading**: Components loaded as needed
- **Efficient Updates**: Vue 3 reactivity optimizations
- **Small Bundle**: Tailwind CSS purging removes unused styles

## ⌨️ Keyboard Shortcuts

### General
- `Ctrl/Cmd + S` - Manual save (auto-save is always active)
- `Ctrl/Cmd + ,` - Open settings panel
- `Ctrl/Cmd + Shift + P` - Open AI processing menu for selected text
- `Escape` - Close open dialogs/panels

### Text Formatting (Vue Quill)
- `Ctrl/Cmd + B` - Toggle bold
- `Ctrl/Cmd + I` - Toggle italic
- `Ctrl/Cmd + U` - Toggle underline
- `Ctrl/Cmd + Shift + X` - Toggle strikethrough
- `Ctrl/Cmd + Shift + C` - Toggle code format
- `Ctrl/Cmd + [` - Decrease indent
- `Ctrl/Cmd + ]` - Increase indent
- `Ctrl/Cmd + Shift + 7` - Toggle ordered list
- `Ctrl/Cmd + Shift + 8` - Toggle bullet list
- `Ctrl/Cmd + Shift + 9` - Toggle blockquote

### AI Features
- **Select text + `Ctrl/Cmd + Shift + P`** - Open AI menu
- **Select text + `S`** - Quick summarize (when AI menu is open)
- **Select text + `B`** - Quick bullet points (when AI menu is open)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - Amazing desktop app framework enabling secure, lightweight desktop apps
- [Vue.js](https://vuejs.org/) - The progressive JavaScript framework with excellent TypeScript support
- [OpenRouter](https://openrouter.ai/) - AI model access platform providing unified API for multiple models
- [Vue Quill](https://github.com/vueup/vue-quill) - Professional rich text editor component for Vue 3
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development
- [Highlight.js](https://highlightjs.org/) - Syntax highlighting for code blocks
- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- [Vite](https://vitejs.dev/) - Lightning-fast build tool and development server

## 📊 Project Status

![GitHub last commit](https://img.shields.io/github/last-commit/danjdewhurst/ai-scratchpad)
![GitHub issues](https://img.shields.io/github/issues/danjdewhurst/ai-scratchpad)
![GitHub stars](https://img.shields.io/github/stars/danjdewhurst/ai-scratchpad)

**Current Version**: 1.0.0 (Development)
**Status**: Active Development (Phase 7 - Testing & Refinement)
**Last Updated**: January 2025

---

<div align="center">
  <strong>Made with ❤️ and AI</strong>
</div>