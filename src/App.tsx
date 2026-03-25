import './App.css'
import TShirtCustomizer from './components/TShirtCustomizer'
import CartDrawer from './components/CartDrawer'
import { Toaster } from '@/components/ui/sonner'
import { Shirt } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

function App() {
  const { items, addItem, removeItem, clearCart, totalItems, cartTotal } = useCart()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Navbar ── */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Shirt className="h-5 w-5 text-primary" />
            <span>ThreadCraft</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Design</a>
            <a href="#" className="hover:text-foreground transition-colors">Gallery</a>
            <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline text-sm text-muted-foreground">
              Free shipping over $50
            </span>
            <CartDrawer
              items={items}
              totalItems={totalItems}
              cartTotal={cartTotal}
              onRemove={removeItem}
              onClear={clearCart}
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <TShirtCustomizer onAddToCart={addItem} />
      </main>

      <footer className="hidden md:block border-t py-6 text-center text-sm text-muted-foreground">
        © 2025 ThreadCraft · Custom Apparel Made Easy
      </footer>

      <Toaster richColors position="bottom-right" />
    </div>
  )
}

export default App
