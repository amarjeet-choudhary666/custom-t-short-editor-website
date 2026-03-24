import type { CartItem } from '@/hooks/useCart'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Trash2, PackageOpen } from 'lucide-react'
import { toast } from 'sonner'

interface CartDrawerProps {
  items: CartItem[]
  totalItems: number
  cartTotal: number
  onRemove: (id: string) => void
  onClear: () => void
}

// Tiny inline t-shirt swatch using the saved colour
const TShirtSwatch = ({ color }: { color: string }) => (
  <div
    className="w-12 h-12 rounded-lg border border-border shrink-0 flex items-center justify-center text-[10px] font-bold"
    style={{ backgroundColor: color, color: color === '#ffffff' ? '#000' : '#fff' }}
  >
    TEE
  </div>
)

const CartDrawer = ({ items, totalItems, cartTotal, onRemove, onClear }: CartDrawerProps) => {
  const handleCheckout = () => {
    toast.success('Order placed! 🎉', {
      description: 'You\'ll receive a confirmation email shortly.',
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {totalItems > 99 ? '99+' : totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
            {totalItems > 0 && (
              <Badge variant="secondary">{totalItems} item{totalItems !== 1 ? 's' : ''}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <PackageOpen className="h-16 w-16 opacity-30" />
            <div className="text-center">
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add a design to get started</p>
            </div>
          </div>
        ) : (
          <>
            {/* Item list */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
              {items.map((item) => {
                const { options } = item
                const discount = options.quantity >= 3
                return (
                  <div key={item.id}
                    className="flex gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors">
                    <TShirtSwatch color={options.tshirtColor} />

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Text / image indicator */}
                      <p className="text-sm font-medium truncate">
                        {options.text || (options.uploadedImage ? '📷 Image design' : 'Custom design')}
                      </p>

                      {/* Badges row */}
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {options.size}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          Qty {options.quantity}
                        </Badge>
                        {options.fontFamily !== 'Arial' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {options.fontFamily}
                          </Badge>
                        )}
                        {discount && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-green-500">
                            10% off
                          </Badge>
                        )}
                      </div>

                      {/* Price + date */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">${item.totalPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.addedAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        onRemove(item.id)
                        toast.info('Item removed from cart')
                      }}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>

            <div className="space-y-3 pt-2">
              <Separator />

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={cartTotal >= 50 ? 'text-green-600 font-medium' : ''}>
                    {cartTotal >= 50 ? 'FREE' : '$4.99'}
                  </span>
                </div>
                {cartTotal < 50 && (
                  <p className="text-xs text-muted-foreground">
                    Add ${(50 - cartTotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>${(cartTotal + (cartTotal >= 50 ? 0 : 4.99)).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <Button className="w-full gap-2" size="lg" onClick={handleCheckout}>
                <ShoppingCart className="h-4 w-4" />
                Checkout
              </Button>
              <Button variant="outline" className="w-full gap-2" size="sm"
                onClick={() => {
                  onClear()
                  toast.info('Cart cleared')
                }}>
                <Trash2 className="h-3.5 w-3.5" />
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default CartDrawer
