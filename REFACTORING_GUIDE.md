# Presentation Refactoring Guide

This document explains the refactoring of the large `Presentation.tsx` file into a more maintainable structure.

## New Structure

### Components (`src/components/`)
- **`CodeBlock.tsx`** - Reusable syntax-highlighted code block component
- **`TitleSlide.tsx`** - Dedicated component for the title slide
- **`ProgressBar.tsx`** - Progress indicator component
- **`Presentation.tsx`** - Main presentation component (refactored)
- **`index.ts`** - Barrel export for all components

### Hooks (`src/hooks/`)
- **`usePresentation.ts`** - Custom hook for presentation logic (navigation, keyboard handling)
- **`index.ts`** - Barrel export for all hooks

### Data (`src/data/`)
- **`index.ts`** - Barrel export for data (currently using slides from original file)

## Key Improvements

### 1. Separation of Concerns
- **UI Components**: Reusable, focused components
- **Business Logic**: Extracted to custom hooks
- **Data**: Centralized slide data management

### 2. Reusability
- `CodeBlock` can be used across different slides
- `TitleSlide` is a dedicated component for the intro slide
- `ProgressBar` is reusable for any presentation

### 3. Maintainability
- Smaller, focused files are easier to understand and modify
- Clear separation between presentation logic and UI
- Easier to test individual components

### 4. Type Safety
- Proper TypeScript interfaces for all components
- Type-safe props and hooks

## Migration Path

### Phase 1: Extract Components ✅
- [x] Create `CodeBlock` component
- [x] Create `TitleSlide` component  
- [x] Create `ProgressBar` component
- [x] Create `usePresentation` hook

### Phase 2: Refactor Main Component ✅
- [x] Create `PresentationRefactored.tsx` using extracted components
- [x] Export slides from original file
- [x] Update main.tsx to use refactored version

### Phase 3: Extract Slide Data (Future)
- [ ] Move slides to separate data files
- [ ] Create slide-specific components
- [ ] Implement slide type system

## Usage

The refactored presentation maintains the same functionality as the original but with better organization:

```tsx
// Main component now uses extracted pieces
import { usePresentation } from './hooks/usePresentation';
import ProgressBar from './components/ProgressBar';
import { slides } from './Presentation'; // Imported from original

const PresentationRefactored = () => {
  const { currentSlide } = usePresentation({ totalSlides: slides.length });
  // ... rest of component
};
```

## Benefits

1. **Easier Testing**: Each component can be tested in isolation
2. **Better Reusability**: Components can be reused in other presentations
3. **Cleaner Code**: Smaller files are easier to read and maintain
4. **Type Safety**: Better TypeScript support with proper interfaces
5. **Separation of Concerns**: Logic, UI, and data are properly separated

## Next Steps

1. **Extract More Slide Components**: Create specific components for different slide types
2. **Move Slide Data**: Extract slides to separate data files
3. **Add Tests**: Write unit tests for individual components
4. **Optimize Performance**: Add memoization where needed
5. **Add Features**: Implement slide navigation, notes, etc.

## File Structure

```
src/
├── components/
│   ├── CodeBlock.tsx
│   ├── TitleSlide.tsx
│   ├── ProgressBar.tsx
│   ├── Presentation.tsx
│   └── index.ts
├── hooks/
│   ├── usePresentation.ts
│   └── index.ts
├── data/
│   └── index.ts
├── Presentation.tsx (original - now exports slides)
├── PresentationRefactored.tsx (new main component)
└── main.tsx (updated to use refactored version)
```
