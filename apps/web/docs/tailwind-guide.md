# Tailwind CSS Implementation Guide

This guide outlines best practices for using Tailwind CSS v4 in the project, including responsive design, dark mode support, and integration with shadcn/ui components.

## Core Setup

The project uses Tailwind CSS v4 with the following configuration:

- **PostCSS Plugin**: `@tailwindcss/postcss` for latest Tailwind features
- **Animation**: `tailwindcss-animate` for built-in animations
- **Class Merging**: `tailwind-merge` via the `cn()` utility
- **Component Variants**: `class-variance-authority` for component styling

## Responsive Design Principles

### Mobile-First Approach

Always design for mobile first, then add breakpoint modifiers for larger screens:

```tsx
<div className="p-4 sm:p-6 md:p-8 lg:p-10">
  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
    Responsive Headline
  </h1>
</div>
```

### Breakpoint Reference

| Breakpoint   | CSS       |
| ------------ | --------- |
| xs (default) | < 640px   |
| sm           | >= 640px  |
| md           | >= 768px  |
| lg           | >= 1024px |
| xl           | >= 1280px |
| 2xl          | >= 1536px |

### Layout Guidelines

- Use `container` with `mx-auto` for page sections
- Use `grid` for complex layouts with responsive columns
- Use `flex` for simpler layouts and alignment
- Hide elements at specific breakpoints with utilities like `hidden md:block`

Example of responsive grid:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items will stack on mobile, 2 columns on tablet, 3 columns on desktop */}
</div>
```

### Responsive Images

Use the Next.js `Image` component with size optimization:

```tsx
<Image
  src="/image.jpg"
  alt="Description"
  width={1200}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-auto object-cover"
/>
```

## Dark Mode Implementation

The project uses a "class" strategy for dark mode, which can be toggled via the theme provider.

### Usage with CSS Variables

Dark mode is implemented using CSS variables that adapt automatically:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}
```

### Dark Mode Variants

Use the `dark:` prefix for dark mode styles:

```tsx
<div className="bg-white text-black dark:bg-black dark:text-white">
  This text adapts to dark mode
</div>
```

### Testing Dark Mode

The `ThemeToggle` component allows users to manually switch between light and dark mode. During development, use the Tailwind Indicator to see current breakpoints.

## Component Styling Patterns

### Using the `cn()` Utility

Always use the `cn()` utility function from `@/lib/utils` to merge classes:

```tsx
import { cn } from "@/lib/utils";

function Button({ className, ...props }) {
  return (
    <button
      className={cn("bg-primary text-white px-4 py-2 rounded", className)}
      {...props}
    />
  );
}
```

### Class Variance Authority (CVA)

Use CVA for components with multiple variants:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        outline: "border border-input bg-background",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-10 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### shadcn/ui Components

The project uses shadcn/ui components which are styled with Tailwind CSS. Extend these components rather than overriding them directly:

```tsx
import { Button } from "@/components/ui/button";

function CustomButton({ children, ...props }) {
  return (
    <Button className="bg-gradient-to-r from-blue-500 to-purple-500" {...props}>
      {children}
    </Button>
  );
}
```

## Performance Optimization

### Smaller Bundle Size

- Use `@tailwindcss/postcss` for better optimization
- Purge unused styles with the `content` directive in `tailwind.config.js`
- Avoid large inline styles; use composed classes

### Responsive Testing

Use the `TailwindIndicator` component during development to see current breakpoint:

```tsx
// Already included in the layout
<TailwindIndicator />
```

## Common Utilities and Best Practices

### Layout

- `container mx-auto` for centered content
- `grid grid-cols-X gap-Y` for grid layouts
- `flex flex-col md:flex-row` for responsive flex direction

### Typography

- Use `text-sm/md/lg/etc.` for font sizes
- Apply `font-bold`, `italic`, etc. as needed
- Use `text-foreground`, `text-muted-foreground` for semantic colors

### Spacing

- Prefer `gap-X` for flex and grid children
- Use `p-X` for padding and `m-X` for margin
- Use spacing utilities consistently (e.g., multiples of 4)

### Accessibility

- Use `sr-only` for screen reader text
- Ensure color contrast meets WCAG standards
- Test with keyboard navigation
- Use correct semantic elements with proper styling

## Working with Tailwind v4 Features

### New Semantic Size Utilities

Use the semantic size utilities instead of width/height:

```tsx
// Old way
<div className="w-4 h-4"></div>

// New way
<div className="size-4"></div>
```

### OKLCH Colors

The theme uses OKLCH colors for better color spaces. Access directly via CSS variables:

```tsx
<div style={{ backgroundColor: "var(--primary)" }}></div>
```

### Custom Variants

The project supports custom variants like `.dark *` for dark mode, which can be configured in the `tailwind.config.js`.

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Responsively App](https://responsively.app/) - For testing responsive designs
