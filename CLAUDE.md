# AI Scratchpad - Claude Instructions

## Project Overview
This is a Tauri + Vue 3 application for an AI-powered scratchpad. Single-document text editor with AI processing capabilities via OpenRouter API.

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run tauri dev` - Run Tauri development mode
- `npm run tauri build` - Build Tauri application
- Use bun instead of node

## Project Structure
- `src/` - Vue frontend source
- `src-tauri/` - Rust backend source
- `PLAN.md` - Comprehensive development roadmap

## Key Technologies
- Vue 3 + TypeScript
- Tauri (Rust backend)
- Target: Rich text editor with markdown support
- AI integration via OpenRouter API
- Local file persistence

## Development Guidelines
- Follow the phased approach outlined in PLAN.md
- Maintain clean, minimal UI focused on writing experience
- Implement proper error handling for AI API calls
- Ensure data persistence across app restarts
- Test all features thoroughly before marking tasks complete

## Current Status
Phase 1 (Cleanup & Foundation) - ✅ COMPLETED
Phase 2 (Core Editor Implementation) - ✅ COMPLETED  
Phase 3 (Data Persistence) - ✅ COMPLETED
Phase 4 (AI Integration Setup) - ✅ COMPLETED
Phase 5 (Text Processing Features) - ✅ COMPLETED
Phase 6 (UI/UX Polish) - ✅ COMPLETED

Current Phase: Phase 7 (Testing & Refinement)
- Comprehensive AI-powered scratchpad with Vue Quill editor
- OpenRouter API integration with gpt-4.1-nano
- Auto-save functionality and data persistence
- Clean minimal UI with keyboard shortcuts and settings panel

## Testing Guidelines
- I will run the tauri dev server myself. Do not run it or kill it. Use playwright MCP to test.