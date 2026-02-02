# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

晋文源智慧助教平台 (Jinwyuan Smart Teaching Assistant Platform) - A Vue 3 educational platform frontend replica built with Vite and Element Plus. This is a Chinese-language educational resource management system with mock data, no backend required.

**Note**: A user-facing `GETTING_STARTED.md` file exists in the project root for new developers. This CLAUDE.md file is specifically for Claude Code guidance.

## Development Commands

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Starts development server at http://localhost:3000 (configured in vite.config.js to auto-open)

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Technology Stack

- **Vue 3.3+** with Composition API (`<script setup>` syntax)
- **Vite 4.5+** for build tooling
- **Element Plus 2.4+** UI component library (Chinese locale configured)
- **@element-plus/icons-vue** for icons (all icons globally registered in main.js)

## Architecture Overview

### Application Structure

The app follows a **single-page application (SPA)** architecture with:

1. **Fixed Layout System**: Three-part layout
   - `Header.vue`: Top navigation with tab system (fixed position)
   - `LeftNav.vue`: Collapsible left sidebar menu (fixed position)
   - Content area: Main scrollable content region

2. **State Management**: All state managed in `App.vue` using Vue 3 Composition API refs
   - No Vuex/Pinia - simple reactive state pattern
   - Component communication via props and events
   - Key state: `currentLeftMenu`, `currentTab`, `leftNavCollapsed`, `showPaperCenter`

3. **Navigation Flow**:
   - Left menu items map to different page components (see `menuMap` in App.vue)
   - Some menus support top tabs (see `show-tabs` logic in Header.vue)
   - Special "Paper Center" mode that overlays regular navigation

### Key Component Relationships

**App.vue** is the orchestrator that:
- Manages global navigation state
- Conditionally renders page components based on `currentLeftMenu`
- Handles special "Paper Center" overlay mode with state preservation
- Coordinates between components via refs and event handlers

**Navigation Components**:
- `Header.vue`: Receives `currentTab`, emits `tab-change`
- `LeftNav.vue`: Receives `currentMenu`, emits `menu-change` and `toggle`
- Both controlled by App.vue parent state

**Content Components** (9 main pages):
```
home → Home.vue
digital-library → DigitalLibrary.vue
prep-plan → PlatformSharing.vue (supports @goto-paper-center)
prep-resource → PrepareResource.vue
prep-paper → SmartPaper.vue (has tabs, supports @goto-paper-center)
homework → HomeworkManage.vue (has tabs)
analysis → SituationAnalysis.vue (has tabs)
school → SchoolManage.vue (has tabs)
my → MyCenter.vue (has tabs)
```

**Special Components**:
- `PaperCenter.vue`: Overlay component for test paper creation, activated via `@goto-paper-center` event from certain pages
- `FloatTools.vue`: Globally visible floating toolbar (always rendered)
- `ScreenPresentation.vue`: Screen presentation mode component

### Paper Center Navigation Pattern

Unique navigation system for test paper assembly:

1. User clicks "组卷" in `DigitalLibrary.vue`, `PlatformSharing.vue`, or `SmartPaper.vue`
2. Component emits `@goto-paper-center` with catalog data
3. `App.vue` saves previous menu state in `previousMenuState`
4. Sets `showPaperCenter = true`, which overlays all other content
5. When user exits Paper Center (back/save), state is restored

This allows users to enter paper assembly mode from multiple entry points and return to exactly where they were.

### Mock Data System

All data is static mock data in `src/mock/data.js`:
- `mockResources`: Educational resource catalog (books, materials) including:
  - Round 1 (一轮) review materials: 古诗文, 语言文字积累与梳理, 整本书阅读, 写作, 现代文读写
  - Round 2 (二轮) review materials: 分类整合, 综合训练, 素材集锦
  - Round 3 (三轮) review materials: 冲刺调整, 综合演练, 专项提升
- `years`: Academic year options
- `stages`: Educational stages (小学/初中/高中)
- `subjects`: Subject hierarchies per stage

Cover images are stored in `/public/covers/` directory with naming patterns:
- `cover_*.jpg`: Round 1 materials
- `round2_*.jpg`: Round 2 materials
- `round3_*.jpg`: Round 3 materials

No API calls or backend integration exists.

### Styling Approach

- **Global styles**: `src/styles/global.css` for app-wide CSS
- **Component-scoped styles**: Each `.vue` file has `<style scoped>`
- **Design system**:
  - Primary color: Purple gradient (#667eea → #764ba2)
  - Layout: Fixed header (top) + fixed sidebar (left) + scrollable content
  - Responsive breakpoint: 768px for mobile
  - Content wrapper transitions when sidebar collapses (260px ↔ 64px margin)

### Component Reusability Pattern

Several components expose `resetState()` methods via template refs:
- `DigitalLibrary.vue` (ref: `digitalLibraryRef`)
- `PlatformSharing.vue` (ref: `platformSharingRef`)

Called when user clicks already-active menu item to reset the page state.

## Vite Configuration

- **Path alias**: `@` mapped to `src/` directory
- **Dev server**: Host 0.0.0.0, port 3000, auto-open browser
- **Vue plugin**: Single-file component support

## Special Considerations

### Language & Locale
- **Chinese interface**: All UI text, comments, and variable names use Chinese
- Element Plus configured with `zh-cn` locale in main.js

### Icon System
All Element Plus icons are globally registered (main.js:12-14), so any icon from `@element-plus/icons-vue` can be used directly in templates without import.

### No Routing Library
Navigation handled through conditional rendering in App.vue, not Vue Router. Menu changes trigger component swaps via `v-if` directives.

### State Reset Pattern
When clicking active menu item, specific components can reset their state. Implement `resetState()` method and expose via `defineExpose()` if adding similar functionality to new components.

### Assets
- Static assets in project root: `logo.png`, `bg.3e971a55.png`
- Cover images in `/public/covers/` referenced by mock data

## External Libraries

- `jspdf`: PDF generation for paper export
- `jszip`: ZIP file creation for batch downloads
