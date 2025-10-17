# The Beauties of Signals: From Change Detection To Synchronization

An in-depth presentation about Angular's evolution from Zone.js-based change detection to Signals-based reactive synchronization, explaining how Signals solve the infamous NG100 (ExpressionChangedAfterItHasBeenChecked) error.

## 🎯 Talk Overview

This talk covers the complete journey of Angular's change detection architecture:
- Manual change detection era
- Zone.js automatic change detection
- Component views and bindings architecture
- Ivy compiler instructions
- Unidirectional data flow and NG100 error
- OnPush strategy and optimization techniques
- Signals reactive primitives
- Zoneless change detection
- How Signals enable controlled bi-directional flow

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The presentation will be available at `http://localhost:3000`

## 🎨 Features

- 28 comprehensive slides covering the entire change detection evolution
- Interactive navigation with keyboard and mouse
- Beautiful dark theme with syntax highlighting
- Code examples from Angular's source code
- Visual diagrams and explanations

## 📚 Content Structure

1. **Web Development 101** - Manual change detection
2. **Component Views and Bindings** - Angular's foundation
3. **Ivy Instructions** - How templates become change detection code
4. **Zone.js** - The notification system
5. **Unidirectional Data Flow** - Why top-down checking
6. **NG100 Error** - The enforcement mechanism
7. **OnPush Strategy** - Selective checking
8. **markViewDirty** - The dirtiness algorithm
9. **Synchronization Loop** - ApplicationRef.tick internals
10. **Signals** - Reactive graph and dependency tracking
11. **Local Change Detection** - Fine-grained reactivity
12. **Zoneless** - The final form
13. **Hybrid Mode** - Best of both worlds
14. And much more...

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

## 📖 Based on Research

This presentation is based on months of reverse engineering Angular's source code and deep technical analysis of:
- Angular Ivy compiler
- Reactive signals implementation
- Change detection scheduler
- Zone.js integration
- And many internal Angular APIs

## 👤 Author

**Khang Tran**

---

Built with ❤️ for NG-Asia Conference
