# AI-Powered Scratchpad Development Plan

## Project Summary
Building a single-document AI-powered scratchpad application using Tauri + Vue. The app will feature a visual rich text editor with AI-powered text processing capabilities via OpenRouter API.

## Core Goals
- Single persistent note interface that survives app restarts
- Visual rich text editor with WYSIWYG editing experience
- Text selection and AI processing (summarize and bullet points for MVP)
- Clean, minimal UI focused on writing experience
- Local data persistence in app data directory

## Development Plan

### Phase 1: Cleanup & Foundation ✅ COMPLETED
- [x] Remove demo content from App.vue (greet functionality, logos, styling)
- [x] Remove demo Rust command from lib.rs
- [x] Clean up unused assets (tauri.svg, vite.svg, vue.svg)
- [x] Set up basic app structure and routing if needed
- [x] Basic editor layout with textarea implemented
- [x] Clean foundation with dark mode support ready for feature development

### Phase 2: Core Editor Implementation ✅ COMPLETED
**MVP Focus: Visual Rich Text Editing with Vue Quill + Tailwind CSS**
- **Editor**: Vue Quill - Vue 3 native, TypeScript support, WYSIWYG visual editing
- **Styling**: Tailwind CSS - Utility-first, optimized for Tauri, excellent performance
- **Approach**: Clean, minimal UI with professional visual editing experience

**Tasks:**
- [x] Install and configure Tailwind CSS for styling
- [x] Install and configure Vue Quill for visual rich text editing
- [x] Replace textarea with Vue Quill editor component
- [x] Style Vue Quill with Tailwind CSS classes
- [x] Configure Vue Quill with essential formatting options (bold, italic, lists, etc.)
- [x] Set up dark/light mode theming with Tailwind

### Phase 3: Data Persistence ✅ COMPLETED
- [x] Add Tauri filesystem plugin for local storage
- [x] Configure app data directory for note storage
- [x] Implement auto-save functionality
- [x] Create note loading on app startup from app data directory
- [x] Handle file creation if no existing note

### Phase 4: AI Integration Setup ✅ COMPLETED
**Approach: OpenAI SDK with OpenRouter Endpoint**
- **Choice**: Use standard `openai` npm package with OpenRouter base URL
- **Default Model**: `openai/gpt-4.1-nano` for optimal performance and cost
- **Benefits**: Familiar API, excellent TypeScript support, wide community support
- **Configuration**: Set base URL to `https://openrouter.ai/api/v1`
- **Installation**: `bun add openai`

**Tasks:**
- [x] Install `openai` package for OpenRouter integration
- [x] Create OpenRouter service module using OpenAI SDK with OpenRouter base URL
- [x] Configure OpenAI client with OpenRouter endpoint and API key (gpt-4.1-nano)
- [x] Implement secure API key storage using Tauri's store plugin
- [x] Add error handling for API failures and rate limiting
- [x] Set up optional headers for OpenRouter leaderboard integration

### Phase 5: Text Processing Features (MVP Focus) ✅ COMPLETED
**MVP AI Functions:**
- **Summarize**: Condense selected text into key points
- **Bullet Points**: Convert selected text into structured bullet points

**Tasks:**
- [x] Implement text selection detection in Vue Quill
- [x] Create AI action menu/toolbar for selected text
- [x] Add "Summarize" action with gpt-4.1-nano
- [x] Add "Bullet Points" action with gpt-4.1-nano
- [x] Add loading states and progress indicators
- [x] Handle AI response insertion back into editor
- [x] Add API key configuration UI with secure storage

### Phase 6: UI/UX Polish ✅ COMPLETED
- [x] Design and implement clean, minimal interface
- [x] Add keyboard shortcuts for common actions
- [x] Implement proper error messaging
- [x] Add settings/preferences panel
- [x] Optimize performance and responsiveness

### Phase 7: Testing & Refinement
- [ ] Test all AI actions with various text selections
- [ ] Verify data persistence across app restarts
- [ ] Test error scenarios (no internet, API failures)
- [ ] Performance testing with large documents
- [ ] User experience testing and refinements

### Phase 8: Code Quality & Development Workflow
- [ ] Tidy up src/ directory - needs properly splitting out into components/views structure
- [ ] Add comprehensive test suite
- [ ] Add ESLint and Prettier for code formatting and linting
- [ ] Add CI pipeline for tests, ESLint, Prettier and building artifacts

## Technical Stack
**Core Framework:**
- **Frontend**: Vue 3 + TypeScript
- **Backend**: Tauri (Rust)
- **AI API**: OpenRouter

**UI & Styling:**
- **CSS Framework**: Tailwind CSS (utility-first, optimized for Tauri, excellent performance)
- **Rich Text Editor**: Vue Quill (Vue 3 native, WYSIWYG visual editing for MVP)

**Desktop Integration:**
- **Storage**: Tauri filesystem API for local persistence in app data directory
- **AI Integration**: OpenAI SDK with OpenRouter endpoint (default: gpt-4.1-nano)
- **Settings**: Tauri store plugin for secure configuration

## Key Dependencies to Add
**Phase 2**: `@vueup/vue-quill` (visual rich text editing), `tailwindcss` (UI styling)
**Phase 3**: `@tauri-apps/plugin-fs`
**Phase 4**: `openai`, `@tauri-apps/plugin-store`

## Current Status
- [x] Project initialization complete
- [x] Development plan created
- [x] **Phase 1 (Cleanup & Foundation) - COMPLETED**
- [x] Package research completed with detailed recommendations
- [x] **Phase 2 (Core Editor Implementation) - COMPLETED**
- [x] **Phase 3 (Data Persistence) - COMPLETED**
- [x] **Phase 4 (AI Integration Setup) - COMPLETED**
- [x] **Phase 5 (Text Processing Features) - COMPLETED**
- [x] **Phase 6 (UI/UX Polish) - COMPLETED**

## Research Summary
✅ **Rich Text Editor**: Vue Quill selected for MVP - Vue 3 native, visual WYSIWYG editing, TypeScript support
✅ **AI Integration**: OpenAI SDK with OpenRouter endpoint (gpt-4.1-nano) - familiar API, excellent TypeScript support
✅ **UI Framework**: Tailwind CSS selected for styling - utility-first, optimized for Tauri, excellent performance
✅ **MVP Focus**: Two AI functions (Summarize + Bullet Points), visual editing only, app data storage

### Technical Advantages for MVP:
**Vue Quill Benefits:**
- **Visual Editing**: WYSIWYG experience, no markdown syntax complexity
- **Vue 3 Native**: Perfect integration with Composition API and TypeScript
- **Rich Formatting**: Bold, italic, lists, headings for structured content
- **Easy AI Integration**: Simple text extraction for AI processing

**Tailwind CSS Benefits:**
- **Utility-First**: Rapid development with utility classes
- **Performance**: Optimized for production, removes unused CSS
- **Consistency**: Systematic design tokens and spacing
- **Dark Mode**: Built-in dark mode support with `dark:` prefix

**OpenAI SDK + OpenRouter Benefits:**
- **Familiar API**: Standard OpenAI SDK interface, widely known and documented
- **Default Model**: gpt-4.1-nano for optimal performance and cost efficiency
- **TypeScript Support**: Excellent type definitions and autocomplete
- **Community Support**: Large ecosystem, easy to find help and examples
- **Simple Configuration**: Just change base URL to OpenRouter endpoint
- **Model Flexibility**: Can switch models easily if needed