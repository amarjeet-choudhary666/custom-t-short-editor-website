import type { CustomizationOptions, TShirtSize, TextAlign } from './TShirtCustomizer'
import type { CartItem } from '@/hooks/useCart'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  ShoppingCart, RotateCcw, Minus, Plus, Upload, X, ImageIcon, RotateCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface CustomizationPanelProps {
  options: CustomizationOptions
  totalPrice: string
  updateOption: <K extends keyof CustomizationOptions>(key: K, value: CustomizationOptions[K]) => void
  onAddToCart: (options: CustomizationOptions) => CartItem
}

const TSHIRT_COLORS = [
  { name: 'Midnight', value: '#1e293b' },
  { name: 'White',    value: '#ffffff' },
  { name: 'Navy',     value: '#1e40af' },
  { name: 'Red',      value: '#dc2626' },
  { name: 'Forest',   value: '#16a34a' },
  { name: 'Purple',   value: '#9333ea' },
  { name: 'Slate',    value: '#6b7280' },
  { name: 'Pink',     value: '#ec4899' },
  { name: 'Orange',   value: '#ea580c' },
  { name: 'Teal',     value: '#0d9488' },
  { name: 'Yellow',   value: '#ca8a04' },
  { name: 'Brown',    value: '#78350f' },
]

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

const PRESETS: { name: string; emoji: string; opts: Partial<CustomizationOptions> }[] = [
  {
    name: 'Bold Statement',
    emoji: '🔥',
    opts: { text: 'NO LIMITS', fontFamily: 'Impact', fontSize: 42, textColor: '#fbbf24', tshirtColor: '#1e293b', bold: true, textRotation: 0 },
  },
  {
    name: 'Vintage',
    emoji: '🎸',
    opts: { text: 'EST. 1994', fontFamily: 'Georgia', fontSize: 28, textColor: '#fb923c', tshirtColor: '#78350f', bold: false, italic: true, textRotation: -5 },
  },
  {
    name: 'Minimal',
    emoji: '✦',
    opts: { text: 'less is more', fontFamily: 'Verdana', fontSize: 22, textColor: '#ffffff', tshirtColor: '#6b7280', bold: false, textRotation: 0 },
  },
  {
    name: 'Sporty',
    emoji: '⚡',
    opts: { text: 'CHAMPION', fontFamily: 'Impact', fontSize: 38, textColor: '#ffffff', tshirtColor: '#1e40af', bold: true, textRotation: 0 },
  },
  {
    name: 'Cute',
    emoji: '🌸',
    opts: { text: 'Stay Cute ♡', fontFamily: 'Comic Sans MS', fontSize: 26, textColor: '#ffffff', tshirtColor: '#ec4899', bold: false, textRotation: 0 },
  },
  {
    name: 'Nature',
    emoji: '🌿',
    opts: { text: 'Go Outside', fontFamily: 'Georgia', fontSize: 28, textColor: '#ffffff', tshirtColor: '#16a34a', bold: false, italic: true, textRotation: 0 },
  },
]

const DEFAULT: CustomizationOptions = {
  text: 'Your Text Here',
  fontSize: 28,
  textColor: '#ffffff',
  tshirtColor: '#1e293b',
  fontFamily: 'Arial',
  textPosition: 'center',
  bold: false,
  italic: false,
  textAlign: 'center',
  size: 'M',
  quantity: 1,
  view: 'front',
  uploadedImage: null,
  imageScale: 1,
  textRotation: 0,
}

const CustomizationPanel = ({ options, totalPrice, updateOption, onAddToCart }: CustomizationPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const changeQty = (delta: number) => {
    updateOption('quantity', Math.min(99, Math.max(1, options.quantity + delta)))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => updateOption('uploadedImage', ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const applyPreset = (preset: typeof PRESETS[0]) => {
    ;(Object.entries(preset.opts) as [keyof CustomizationOptions, never][])
      .forEach(([k, v]) => updateOption(k, v))
    toast.success(`"${preset.name}" preset applied!`)
  }

  const handleAddToCart = () => {
    onAddToCart(options)
    toast.success('Added to cart!', {
      description: `${options.size} · Qty ${options.quantity} · $${options.quantity >= 3
        ? (24.99 * options.quantity * 0.9).toFixed(2)
        : totalPrice}`,
    })
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Customize Your Design</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="design">
          <TabsList className="w-full mb-5">
            <TabsTrigger value="design"  className="flex-1">Design</TabsTrigger>
            <TabsTrigger value="text"    className="flex-1">Text</TabsTrigger>
            <TabsTrigger value="image"   className="flex-1">Image</TabsTrigger>
            <TabsTrigger value="order"   className="flex-1">Order</TabsTrigger>
          </TabsList>

          {/* ════════════ DESIGN TAB ════════════ */}
          <TabsContent value="design" className="space-y-5 mt-0">

            {/* Presets */}
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border
                               hover:border-primary hover:bg-accent transition-colors text-center"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="text-xs font-medium leading-tight">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* T-Shirt Color */}
            <div className="space-y-2">
              <Label>T-Shirt Color</Label>
              <div className="flex flex-wrap gap-2">
                {TSHIRT_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updateOption('tshirtColor', color.value)}
                    title={color.name}
                    aria-label={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
                      ${options.tshirtColor === color.value ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border'}`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
                <label className="w-8 h-8 rounded-full border-2 border-dashed border-border cursor-pointer
                                  flex items-center justify-center text-xs text-muted-foreground hover:border-primary transition"
                  title="Custom color">
                  +
                  <input type="color" className="sr-only" value={options.tshirtColor}
                    onChange={(e) => updateOption('tshirtColor', e.target.value)} />
                </label>
              </div>
            </div>
          </TabsContent>

          {/* ════════════ TEXT TAB ════════════ */}
          <TabsContent value="text" className="space-y-5 mt-0">

            {/* Text input */}
            <div className="space-y-2">
              <Label htmlFor="custom-text">Custom Text</Label>
              <Input
                id="custom-text"
                value={options.text}
                onChange={(e) => updateOption('text', e.target.value)}
                placeholder="Enter your text…"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground text-right">{options.text.length}/50</p>
            </div>

            {/* Font + Style */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Font</Label>
                <Select value={options.fontFamily} onValueChange={(v) => updateOption('fontFamily', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONTS.map(f => (
                      <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Style</Label>
                <div className="flex gap-2">
                  <Toggle pressed={options.bold} onPressedChange={(v) => updateOption('bold', v)}
                    aria-label="Bold" size="sm" className="flex-1"><Bold className="h-4 w-4" /></Toggle>
                  <Toggle pressed={options.italic} onPressedChange={(v) => updateOption('italic', v)}
                    aria-label="Italic" size="sm" className="flex-1"><Italic className="h-4 w-4" /></Toggle>
                </div>
              </div>
            </div>

            {/* Font size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">{options.fontSize}px</span>
              </div>
              <Slider min={14} max={60} step={1} value={[options.fontSize]}
                onValueChange={(v) => updateOption('fontSize', v[0])} />
            </div>

            {/* Align + Position */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Alignment</Label>
                <div className="flex gap-1">
                  {([
                    { align: 'left',   Icon: AlignLeft },
                    { align: 'center', Icon: AlignCenter },
                    { align: 'right',  Icon: AlignRight },
                  ] as { align: TextAlign; Icon: React.ElementType }[]).map(({ align, Icon }) => (
                    <Toggle key={align} pressed={options.textAlign === align}
                      onPressedChange={() => updateOption('textAlign', align)}
                      aria-label={align} size="sm" className="flex-1">
                      <Icon className="h-4 w-4" />
                    </Toggle>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <div className="flex gap-1">
                  {(['top', 'center', 'bottom'] as const).map(pos => (
                    <Button key={pos} size="sm"
                      variant={options.textPosition === pos ? 'default' : 'outline'}
                      onClick={() => updateOption('textPosition', pos)}
                      className="flex-1 capitalize text-xs px-1">{pos}</Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Text rotation */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-1">
                  <RotateCw className="h-3.5 w-3.5" /> Rotation
                </Label>
                <span className="text-sm text-muted-foreground">{options.textRotation}°</span>
              </div>
              <Slider min={-45} max={45} step={1} value={[options.textRotation]}
                onValueChange={(v) => updateOption('textRotation', v[0])} />
            </div>

            <Separator />

            {/* Text Color */}
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex flex-wrap gap-2">
                {TEXT_COLORS.map(color => (
                  <button key={color.value} onClick={() => updateOption('textColor', color.value)}
                    title={color.name} aria-label={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
                      ${options.textColor === color.value ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border'}`}
                    style={{ backgroundColor: color.value }} />
                ))}
                <label className="w-8 h-8 rounded-full border-2 border-dashed border-border cursor-pointer
                                  flex items-center justify-center text-xs text-muted-foreground hover:border-primary transition"
                  title="Custom color">
                  +
                  <input type="color" className="sr-only" value={options.textColor}
                    onChange={(e) => updateOption('textColor', e.target.value)} />
                </label>
              </div>
            </div>
          </TabsContent>

          {/* ════════════ IMAGE TAB ════════════ */}
          <TabsContent value="image" className="space-y-4 mt-0">
            {options.uploadedImage ? (
              <div className="space-y-4">
                <div className="relative w-full rounded-lg border border-border bg-muted flex items-center gap-3 p-3">
                  <img src={options.uploadedImage} alt="Uploaded design"
                    className="w-16 h-16 object-contain rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Image uploaded</p>
                    <p className="text-xs text-muted-foreground">Drag it on the shirt to reposition</p>
                  </div>
                  <Button size="icon" variant="ghost"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => updateOption('uploadedImage', null)} aria-label="Remove image">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Image Size</span>
                    <span>{Math.round(options.imageScale * 100)}%</span>
                  </div>
                  <Slider min={40} max={200} step={5}
                    value={[options.imageScale * 100]}
                    onValueChange={(v) => updateOption('imageScale', v[0] / 100)} />
                </div>

                <Button variant="outline" className="w-full gap-2"
                  onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" /> Replace Image
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl p-8
                             flex flex-col items-center gap-3 text-muted-foreground
                             hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  <ImageIcon className="h-10 w-10" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs mt-1">PNG, JPG, SVG, WEBP · Max 5MB</p>
                  </div>
                </button>
                <Button variant="outline" className="w-full gap-2"
                  onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" /> Browse Files
                </Button>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*"
              className="sr-only" onChange={handleImageUpload} />
          </TabsContent>

          {/* ════════════ ORDER TAB ════════════ */}
          <TabsContent value="order" className="space-y-5 mt-0">

            {/* Size */}
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map(s => (
                  <Button key={s} size="sm"
                    variant={options.size === s ? 'default' : 'outline'}
                    onClick={() => updateOption('size', s)}
                    className="w-12">{s}</Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Not sure? Check our size guide →</p>
            </div>

            <Separator />

            {/* Quantity */}
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex items-center gap-3">
                <Button size="icon" variant="outline" onClick={() => changeQty(-1)} disabled={options.quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-semibold text-lg">{options.quantity}</span>
                <Button size="icon" variant="outline" onClick={() => changeQty(1)} disabled={options.quantity >= 99}>
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="ml-auto text-sm text-muted-foreground">$24.99 each</span>
              </div>
            </div>

            <Separator />

            {/* Price breakdown */}
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit price</span>
                <span>$24.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span>× {options.quantity}</span>
              </div>
              {options.quantity >= 3 && (
                <div className="flex justify-between text-green-600">
                  <span>Bulk discount (3+)</span>
                  <span>-10%</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${options.quantity >= 3
                  ? (24.99 * options.quantity * 0.9).toFixed(2)
                  : totalPrice}</span>
              </div>
              {options.quantity >= 3 && (
                <p className="text-xs text-green-600">🎉 You're saving ${(24.99 * options.quantity * 0.1).toFixed(2)}!</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-5" />

        {/* ── Action buttons (always visible) ── */}
        <div className="space-y-3">
          <Button className="w-full gap-2" size="lg" onClick={handleAddToCart}>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart — ${options.quantity >= 3
              ? (24.99 * options.quantity * 0.9).toFixed(2)
              : totalPrice}
          </Button>
          <Button variant="outline" className="w-full gap-2" size="lg"
            onClick={() => {
              ;(Object.keys(DEFAULT) as (keyof CustomizationOptions)[])
                .forEach(k => updateOption(k, DEFAULT[k] as never))
              toast.info('Design reset to defaults')
            }}>
            <RotateCcw className="h-4 w-4" /> Reset Design
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomizationPanel
