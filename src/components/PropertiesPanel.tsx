import type { CustomizationOptions, TShirtSize, TextAlign } from './TShirtCustomizer'
import type { CartItem } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  ShoppingCart, RotateCcw, Minus, Plus, RotateCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface PropertiesPanelProps {
  options: CustomizationOptions
  totalPrice: string
  updateOption: <K extends keyof CustomizationOptions>(k: K, v: CustomizationOptions[K]) => void
  onAddToCart: (options: CustomizationOptions) => CartItem
}

const TEXT_COLORS = [
  { name: 'White',  value: '#ffffff' },
  { name: 'Black',  value: '#000000' },
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Red',    value: '#ef4444' },
  { name: 'Blue',   value: '#3b82f6' },
  { name: 'Green',  value: '#22c55e' },
  { name: 'Pink',   value: '#f472b6' },
  { name: 'Orange', value: '#fb923c' },
]

const FONTS = [
  { label: 'Arial',         value: 'Arial' },
  { label: 'Georgia',       value: 'Georgia' },
  { label: 'Courier New',   value: 'Courier New' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' },
  { label: 'Impact',        value: 'Impact' },
  { label: 'Verdana',       value: 'Verdana' },
  { label: 'Trebuchet MS',  value: 'Trebuchet MS' },
  { label: 'Palatino',      value: 'Palatino' },
]

const SIZES: TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Quick design presets
const PRESETS = [
  { name: 'Bold',    emoji: '🔥', opts: { text: 'NO LIMITS',    fontFamily: 'Impact',        fontSize: 42, textColor: '#fbbf24', tshirtColor: '#1e293b', bold: true,  textRotation: 0 } },
  { name: 'Vintage', emoji: '🎸', opts: { text: 'EST. 1994',    fontFamily: 'Georgia',       fontSize: 28, textColor: '#fb923c', tshirtColor: '#78350f', bold: false, italic: true, textRotation: -5 } },
  { name: 'Minimal', emoji: '✦',  opts: { text: 'less is more', fontFamily: 'Verdana',       fontSize: 22, textColor: '#ffffff', tshirtColor: '#6b7280', bold: false, textRotation: 0 } },
  { name: 'Sporty',  emoji: '⚡', opts: { text: 'CHAMPION',     fontFamily: 'Impact',        fontSize: 38, textColor: '#ffffff', tshirtColor: '#1e40af', bold: true,  textRotation: 0 } },
  { name: 'Cute',    emoji: '🌸', opts: { text: 'Stay Cute ♡',  fontFamily: 'Comic Sans MS', fontSize: 26, textColor: '#ffffff', tshirtColor: '#ec4899', bold: false, textRotation: 0 } },
  { name: 'Nature',  emoji: '🌿', opts: { text: 'Go Outside',   fontFamily: 'Georgia',       fontSize: 28, textColor: '#ffffff', tshirtColor: '#16a34a', bold: false, italic: true, textRotation: 0 } },
]

const DEFAULT: CustomizationOptions = {
  text: 'Your Text Here', fontSize: 28, textColor: '#ffffff', tshirtColor: '#1e293b',
  fontFamily: 'Arial', textPosition: 'center', bold: false, italic: false,
  textAlign: 'center', size: 'M', quantity: 1, view: 'front',
  uploadedImage: null, imageScale: 1, textRotation: 0,
}

const PropertiesPanel = ({ options, totalPrice, updateOption, onAddToCart }: PropertiesPanelProps) => {
  const changeQty = (d: number) => updateOption('quantity', Math.min(99, Math.max(1, options.quantity + d)))

  const applyPreset = (p: typeof PRESETS[0]) => {
    ;(Object.entries(p.opts) as [keyof CustomizationOptions, never][]).forEach(([k, v]) => updateOption(k, v))
    toast.success(`"${p.name}" preset applied!`)
  }

  const handleAddToCart = () => {
    onAddToCart(options)
    const disc = options.quantity >= 3
    toast.success('Added to cart!', {
      description: `${options.size} · Qty ${options.quantity} · $${disc
        ? (24.99 * options.quantity * 0.9).toFixed(2) : totalPrice}`,
    })
  }

  const discountedTotal = options.quantity >= 3
    ? (24.99 * options.quantity * 0.9).toFixed(2)
    : totalPrice

  return (
    <aside className="w-72 bg-white border-l flex flex-col shrink-0 shadow-sm z-10 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-sm">Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="text">
          <TabsList className="w-full rounded-none border-b h-9 bg-transparent p-0">
            {['text', 'image', 'order', 'presets'].map(t => (
              <TabsTrigger key={t} value={t}
                className="flex-1 rounded-none h-9 text-xs capitalize border-b-2 border-transparent
                           data-[state=active]:border-primary data-[state=active]:shadow-none">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── TEXT ── */}
          <TabsContent value="text" className="p-4 space-y-4 mt-0">
            <div className="space-y-1.5">
              <Label className="text-xs">Text</Label>
              <Input value={options.text} onChange={e => updateOption('text', e.target.value)}
                placeholder="Your text…" maxLength={50} className="h-8 text-sm" />
              <p className="text-[10px] text-muted-foreground text-right">{options.text.length}/50</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Font</Label>
              <Select value={options.fontFamily} onValueChange={v => updateOption('fontFamily', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONTS.map(f => (
                    <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Toggle pressed={options.bold} onPressedChange={v => updateOption('bold', v)}
                size="sm" className="flex-1 h-8"><Bold className="h-3.5 w-3.5" /></Toggle>
              <Toggle pressed={options.italic} onPressedChange={v => updateOption('italic', v)}
                size="sm" className="flex-1 h-8"><Italic className="h-3.5 w-3.5" /></Toggle>
              {([
                { align: 'left'   as TextAlign, Icon: AlignLeft   },
                { align: 'center' as TextAlign, Icon: AlignCenter },
                { align: 'right'  as TextAlign, Icon: AlignRight  },
              ]).map(({ align, Icon }) => (
                <Toggle key={align} pressed={options.textAlign === align}
                  onPressedChange={() => updateOption('textAlign', align)}
                  size="sm" className="flex-1 h-8">
                  <Icon className="h-3.5 w-3.5" />
                </Toggle>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs">Size</Label>
                <span className="text-xs text-muted-foreground">{options.fontSize}px</span>
              </div>
              <Slider min={14} max={60} step={1} value={[options.fontSize]}
                onValueChange={v => updateOption('fontSize', v[0])} />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs flex items-center gap-1">
                  <RotateCw className="h-3 w-3" /> Rotation
                </Label>
                <span className="text-xs text-muted-foreground">{options.textRotation}°</span>
              </div>
              <Slider min={-45} max={45} step={1} value={[options.textRotation]}
                onValueChange={v => updateOption('textRotation', v[0])} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Position</Label>
              <div className="flex gap-1">
                {(['top', 'center', 'bottom'] as const).map(pos => (
                  <Button key={pos} size="sm"
                    variant={options.textPosition === pos ? 'default' : 'outline'}
                    onClick={() => updateOption('textPosition', pos)}
                    className="flex-1 h-7 text-xs capitalize px-1">{pos}</Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label className="text-xs">Text Color</Label>
              <div className="flex flex-wrap gap-1.5">
                {TEXT_COLORS.map(col => (
                  <button key={col.value} onClick={() => updateOption('textColor', col.value)}
                    title={col.name}
                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110
                      ${options.textColor === col.value ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border'}`}
                    style={{ backgroundColor: col.value }} />
                ))}
                <label className="w-7 h-7 rounded-full border-2 border-dashed border-border cursor-pointer
                                  flex items-center justify-center text-xs text-muted-foreground hover:border-primary transition">
                  +<input type="color" className="sr-only" value={options.textColor}
                    onChange={e => updateOption('textColor', e.target.value)} />
                </label>
              </div>
            </div>
          </TabsContent>

          {/* ── IMAGE ── */}
          <TabsContent value="image" className="p-4 space-y-4 mt-0">
            {options.uploadedImage ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted">
                  <img src={options.uploadedImage} alt="Design" className="w-14 h-14 object-contain rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Image added</p>
                    <p className="text-[10px] text-muted-foreground">Drag on canvas to reposition</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive h-7 px-2 text-xs"
                    onClick={() => updateOption('uploadedImage', null)}>Remove</Button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs">Scale</Label>
                    <span className="text-xs text-muted-foreground">{Math.round(options.imageScale * 100)}%</span>
                  </div>
                  <Slider min={40} max={200} step={5} value={[options.imageScale * 100]}
                    onValueChange={v => updateOption('imageScale', v[0] / 100)} />
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                Use the Image tool in the left toolbar to upload an image.
              </p>
            )}
          </TabsContent>

          {/* ── ORDER ── */}
          <TabsContent value="order" className="p-4 space-y-4 mt-0">
            <div className="space-y-1.5">
              <Label className="text-xs">Size</Label>
              <div className="flex gap-1.5 flex-wrap">
                {SIZES.map(s => (
                  <Button key={s} size="sm"
                    variant={options.size === s ? 'default' : 'outline'}
                    onClick={() => updateOption('size', s)}
                    className="w-10 h-8 text-xs">{s}</Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8"
                  onClick={() => changeQty(-1)} disabled={options.quantity <= 1}>
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-8 text-center font-semibold">{options.quantity}</span>
                <Button size="icon" variant="outline" className="h-8 w-8"
                  onClick={() => changeQty(1)} disabled={options.quantity >= 99}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">$24.99 each</span>
              </div>
            </div>

            <Separator />

            <div className="rounded-lg bg-muted p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>${(24.99 * options.quantity).toFixed(2)}</span>
              </div>
              {options.quantity >= 3 && (
                <div className="flex justify-between text-green-600">
                  <span>Bulk discount (3+)</span><span>-10%</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className={(24.99 * options.quantity) >= 50 ? 'text-green-600 font-medium' : ''}>
                  {(24.99 * options.quantity) >= 50 ? 'FREE' : '$4.99'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-sm">
                <span>Total</span><span>${discountedTotal}</span>
              </div>
              {options.quantity >= 3 && (
                <p className="text-green-600">🎉 Saving ${(24.99 * options.quantity * 0.1).toFixed(2)}!</p>
              )}
            </div>
          </TabsContent>

          {/* ── PRESETS ── */}
          <TabsContent value="presets" className="p-4 mt-0">
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border
                             hover:border-primary hover:bg-accent transition-colors text-center">
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="text-xs font-medium">{p.name}</span>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Sticky footer ── */}
      <div className="p-4 border-t space-y-2 bg-white">
        <Button className="w-full gap-2 h-10" onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4" />
          Add to Cart — ${discountedTotal}
        </Button>
        <Button variant="outline" className="w-full gap-2 h-9 text-xs"
          onClick={() => {
            ;(Object.keys(DEFAULT) as (keyof CustomizationOptions)[]).forEach(k => updateOption(k, DEFAULT[k] as never))
            toast.info('Design reset')
          }}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset Design
        </Button>
      </div>
    </aside>
  )
}

export default PropertiesPanel
