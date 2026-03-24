# Custom T-Shirt Designer

A responsive web application for designing custom t-shirts with live preview functionality.

## Features

- **Live Preview**: See your design changes in real-time on a t-shirt mockup
- **Text Customization**: Add custom text with adjustable font size, style, and position
- **Color Options**: Choose from 8 t-shirt colors and 6 text colors
- **Font Styles**: Select from 6 different font families
- **Text Positioning**: Place text at top, center, or bottom of the t-shirt
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Clean UI**: Modern, intuitive interface built with React and Tailwind CSS

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling framework
- **shadcn/ui** - High-quality UI components (Radix Nova preset)
- **Lucide React** - Beautiful icons
- **SVG** - T-shirt mockup rendering

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── TShirtCustomizer.tsx    # Main container component
│   │   ├── TShirtPreview.tsx       # Live preview with SVG t-shirt
│   │   └── CustomizationPanel.tsx  # Customization controls
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── public/                         # Static assets
└── package.json
```

## Features in Detail

### Customization Options

1. **Text Input**: Enter up to 50 characters of custom text
2. **Font Selection**: Choose from Arial, Georgia, Courier New, Comic Sans MS, Impact, and Verdana
3. **Font Size**: Adjust from 16px to 64px using a slider
4. **Text Position**: Place text at top, center, or bottom of the t-shirt
5. **Text Color**: Select from 6 popular colors
6. **T-Shirt Color**: Choose from 8 different t-shirt colors including Black, White, Navy, Red, Green, Purple, Gray, and Pink

### User Experience

- Real-time preview updates as you make changes
- Character counter for text input
- Visual color pickers with hover effects
- Reset button to restore default settings
- Responsive layout that adapts to screen size
- Sticky preview panel on larger screens for easy reference
- Professional UI components from shadcn/ui
- Smooth transitions and animations
- Accessible form controls with proper labels

## Future Enhancements

- Image upload functionality
- Multiple text layers
- Font weight and style options (bold, italic)
- Text rotation and scaling
- Save designs to local storage
- Export design as image
- Shopping cart integration
- Size selection
- Quantity selector

## License

MIT

## Author

Amarjeet

---

Built as part of a technical assessment for a custom product design platform.
