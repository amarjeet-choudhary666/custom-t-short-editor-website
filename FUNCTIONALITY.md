# Functionality Overview

## T-Shirt Canvas (Live Preview)

- SVG-based t-shirt mockup with realistic shading, creases, hem, seams, and collar (front/back views)
- Dynamic color rendering — shirt color updates gradients, highlights, shadows, and creases in real time
- Draggable design element — click and drag text/image directly on the shirt to reposition it
- Dashed print-area boundary shows the safe zone for design placement
- Dot-grid background (Vistaprint-style editor feel)
- Mouse-wheel zoom (cursor-anchored, 40%–300%) with zoom in/out buttons and percentage display
- Middle-mouse / right-click pan to move around the canvas
- Reset view button to snap back to 100%
- Download design as PNG (renders SVG to canvas, exports file)
- Front/back view toggle with collar shape adapting per view

## Left Toolbar

- Select tool — enables drag-to-reposition mode on the design
- Text tool — switches context to text editing
- Image tool — opens file picker to upload an image directly
- T-shirt color swatches (12 presets + custom color picker)
- Front/Back view toggle button

## Right Properties Panel

### Text Tab
- Custom text input (max 50 chars with live counter)
- Font family selector (Arial, Georgia, Courier New, Comic Sans MS, Impact, Verdana, Trebuchet MS, Palatino)
- Bold and italic toggles
- Text alignment (left / center / right)
- Font size slider (14px–60px)
- Text rotation slider (-45° to +45°)
- Vertical position presets (top / center / bottom)
- Text color swatches (8 presets + custom color picker)

### Image Tab
- Shows uploaded image thumbnail with scale slider (40%–200%)
- Remove image button
- Prompt to use the toolbar image tool when no image is uploaded

### Order Tab
- Size selector (XS, S, M, L, XL, XXL)
- Quantity stepper (1–99)
- Price breakdown: subtotal, bulk discount (10% off for 3+), shipping (free over $50), total
- Savings callout when bulk discount applies

### Presets Tab
- 6 one-click design presets: Bold Statement, Vintage, Sporty, Minimal, Cute, Nature
- Each preset sets text, font, size, color, shirt color, bold/italic, and rotation together

## Cart

- Add to Cart button with live price (bulk discount applied automatically)
- Cart drawer (slide-in sheet) showing all saved items
- Each cart item displays: shirt color swatch, text/image label, size, quantity, font, discount badge, price, timestamp
- Remove individual items or clear entire cart
- Cart total with shipping calculation (free over $50, otherwise $4.99)
- Checkout button with success toast
- Cart persisted to localStorage — survives page refresh
- Cart item count badge on the cart button (capped display at 99+)

## Pricing Logic

- Base price: $24.99 per shirt
- 10% bulk discount when quantity ≥ 3
- Free shipping when order total ≥ $50
- All calculations happen client-side in real time

## General UX

- Toast notifications for: add to cart, preset applied, image uploaded, item removed, cart cleared, design reset, download complete
- Reset Design button restores all options to defaults
- Fully responsive layout: left toolbar + center canvas + right panel
- TypeScript throughout with strict prop typing
- shadcn/ui components: Button, Input, Label, Slider, Select, Toggle, Tabs, Sheet, Badge, Card, Separator, Sonner
