---
name: frontend-builder
description: Build pages, components, layouts, and apply modern styling. Use for web applications and landing pages.
---

# Frontend Skill – Pages, Components & Styling

## Instructions

1. **Page & Layout Structure**
   - Use responsive layouts (mobile-first)
   - Organize content with sections and containers
   - Apply consistent spacing and alignment
   - Use semantic HTML elements (`<header>`, `<main>`, `<footer>`, `<section>`)

2. **Components**
   - Build reusable UI components (buttons, cards, forms, modals)
   - Apply modular CSS or utility-first classes (Tailwind, Bootstrap)
   - Components should accept props/configurations when needed

3. **Styling**
   - Follow a consistent design system (colors, typography, spacing)
   - Use modern CSS techniques: flexbox, grid, animations
   - Apply hover, focus, and active states for interactive elements

4. **Interactions & UX**
   - Add smooth transitions and animations
   - Ensure accessibility (ARIA labels, alt text, keyboard navigation)
   - Optimize for performance (minimize DOM nesting, lazy-load assets)

## Best Practices
- Keep components small and single-purpose
- Use semantic HTML for better SEO & accessibility
- Mobile-first design, then scale up
- Keep CSS organized, DRY, and reusable
- Test components in isolation before integrating

## Example Structure
```html
<section class="page-section bg-gray-50 p-8">
  <div class="container mx-auto">
    <header class="mb-6">
      <h1 class="text-3xl font-bold">Page Title</h1>
      <p class="text-gray-600">Supporting description goes here</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card p-4 bg-white rounded shadow">
        <h2 class="font-semibold">Card Title</h2>
        <p cla
