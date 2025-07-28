# 🧠 AI Scratchpad

A clean, minimal desktop application for intelligent note-taking powered by AI. Built with Tauri + Vue 3 for a native desktop experience with modern web technologies.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20|%20Windows%20|%20Linux-lightgrey.svg)
![Vue](https://img.shields.io/badge/Vue-3.5.13-4FC08D.svg)
![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC131.svg)

## ✨ Features

- **Rich Text Editor** - Visual WYSIWYG editing with Vue Quill
- **AI-Powered Processing** - Transform selected text with AI
  - 📝 **Summarize** - Condense text into key points
  - 🔸 **Bullet Points** - Convert to structured lists
- **Auto-Save** - Persistent storage with automatic saving
- **Clean Interface** - Minimal, distraction-free writing experience
- **Dark/Light Mode** - Adaptive theming for comfort
- **Keyboard Shortcuts** - Efficient workflow controls
- **Cross-Platform** - Native desktop app for all major platforms

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [Rust](https://rustup.rs/) - For Tauri backend
- [OpenRouter API Key](https://openrouter.ai/) - For AI features

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-scratchpad.git
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

1. **API Key Setup**: On first launch, configure your OpenRouter API key in Settings
2. **AI Model**: Default model is `openai/gpt-4.1-nano` for optimal performance
3. **Storage**: Notes are automatically saved to your system's app data directory

## 🛠️ Tech Stack

### Frontend
- **Vue 3** + **TypeScript** - Reactive UI framework
- **Vue Quill** - Rich text editor with WYSIWYG experience
- **Tailwind CSS** - Utility-first styling

### Backend
- **Tauri** - Rust-based desktop framework
- **Filesystem API** - Local file persistence
- **Store Plugin** - Secure settings storage

### AI Integration
- **OpenRouter API** - Access to multiple AI models
- **OpenAI SDK** - Standard API interface

## 📁 Project Structure

```
ai-scratchpad/
├── src/                    # Vue frontend
│   ├── App.vue            # Main application component
│   ├── services/          # AI and data services
│   └── style.css          # Global styles
├── src-tauri/             # Rust backend
│   ├── src/               # Tauri application code
│   └── tauri.conf.json    # App configuration
├── package.json           # Dependencies and scripts
└── PLAN.md               # Development roadmap
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

```bash
bun run dev          # Start Vite development server
bun run build        # Build Vue app for production
bun run tauri dev    # Run Tauri in development mode
bun run tauri build  # Build Tauri application
```

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + S` - Manual save (auto-save is always active)
- `Ctrl/Cmd + ,` - Open settings
- `Ctrl/Cmd + Shift + P` - AI processing menu

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - Amazing desktop app framework
- [Vue](https://vuejs.org/) - The progressive JavaScript framework
- [OpenRouter](https://openrouter.ai/) - AI model access platform
- [Vue Quill](https://github.com/vueup/vue-quill) - Rich text editor component

---

<div align="center">
  <strong>Made with ❤️ and AI</strong>
</div>