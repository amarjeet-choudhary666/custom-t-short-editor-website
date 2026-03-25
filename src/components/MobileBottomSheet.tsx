import { useState, useRef } from 'react'
import type { ActiveTool, CustomizationOptions, TShirtSize, TextAlign } from './TShirtCustomizer'
import type { CartItem } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MousePointer2, Type, ImageIcon, Layers,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  ShoppingCart, RotateCcw, Minus, Plus, RotateCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface MobileBottomSheetProps {
  activeTool: ActiveTool
  setActiveTool: (t: ActiveTool) => void
  options: CustomizationOptions
  totalPrice: string
  updateOption: <K extends keyof CustomizationOptions>(k: K, v: CustomizationOptions[K]) => void
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
]

const SIZES: TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

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

type MobileTab = 'color' | 'text' | 'image' | 'order' | 'presets'

const MobileBottomSheet = ({
  activeTool, setActiveTool, options, totalPrice, updateOption, onAddToCart,
}: MobileBottomSheetProps) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('color')
  const fileRef = useRef<HTMLInputElement>(null)

  const changeQty = (d: number) => updateOption('quantity', Math.min(99, Math.max(1, options.quantity + d)))

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      updateOption('uploadedImage', ev.target?.result as string)
      toast.success('Image added')
      setActiveTab('image')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
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

  const tabs: { id: MobileTab; label: string }[] = [
    { id: 'color',   label: '🎨 Color'   },
    { id: 'text',    label: '✏️ Text'    },
    { id: 'image',   label: '🖼️ Image'   },
    { id: 'order',   label: '🛒 Order'   },
    { id: 'presets', label: '⚡ Presets' },
  ]

  return (
    <div className="bg-white border-t shadow-2xl flex flex-col h-full overflow-hidden">

      {/* ── Top action bar ── */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1 shrink-0">
        {/* Tool pills */}
        <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-none">
          <button onClick={() => setActiveTool('select')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition
              ${activeTool === 'select' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <MousePointer2 className="h-3 w-3" /> Select
          </button>
          <button onClick={() => { setActiveTool('text'); setActiveTab('text') }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition
              ${activeTool === 'text' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Type className="h-3 w-3" /> Text
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 bg-muted text-muted-foreground">
            <ImageIcon className="h-3 w-3" /> Image
          </button>
          <button onClick={() => updateOption('view', options.view === 'front' ? 'back' : 'front')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 bg-muted text-muted-foreground capitalize">
            <Layers className="h-3 w-3" /> {options.view}
          </button>
        </div>

        {/* Cart button */}
        <button onClick={handleAddToCart}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0
                     bg-primary text-primary-foreground shadow-sm">
          <ShoppingCart className="h-3.5 w-3.5" /> ${discountedTotal}
        </button>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex border-b shrink-0 overflow-x-auto scrollbar-none">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 min-w-[64px] py-2 text-[11px] font-medium border-b-2 transition whitespace-nowrap px-1
              ${activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">

        {/* ── COLOR TAB ── */}
        {activeTab === 'color' && (
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-foreground mb-3">T-Shirt Color</p>
              <div className="grid grid-cols-6 gap-3">
                {TSHIRT_COLORS.map(col => (
                  <button key={col.value} onClick={() => updateOption('tshirtColor', col.value)}
                    title={col.name}
                    className={`w-full aspect-square rounded-full border-[3px] transition-all active:scale-95
                      ${options.tshirtColor === col.value
                        ? 'border-primary shadow-md scale-110'
                        : 'border-transparent shadow-sm'}`}
                    style={{ backgroundColor: col.value,
                      boxShadow: col.value === '#ffffff' ? 'inset 0 0 0 1px #e2e8f0' : undefined }} />
                ))}
                {/* custom picker */}
                <label title="Custom"
                  className="w-full aspect-square rounded-full border-2 border-dashed border-border cursor-pointer
                             flex items-center justify-center text-base text-muted-foreground bg-muted">
                  +
                  <input type="color" className="sr-only" value={options.tshirtColor}
                    onChange={e => updateOption('tshirtColor', e.target.value)} />
                </label>
              </div>
              {/* selected color name */}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {TSHIRT_COLORS.find(c => c.value === options.tshirtColor)?.name ?? 'Custom'}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-foreground mb-3">Text Color</p>
              <div className="grid grid-cols-6 gap-3">
                {TEXT_COLORS.map(col => (
                  <button key={col.value} onClick={() => updateOption('textColor', col.value)}
                    title={col.name}
                    className={`w-full aspect-square rounded-full border-[3px] transition-all active:scale-95
                      ${options.textColor === col.value
                        ? 'border-primary shadow-md scale-110'
                        : 'border-transparent shadow-sm'}`}
                    style={{ backgroundColor: col.value,
                      boxShadow: col.value === '#ffffff' ? 'inset 0 0 0 1px #e2e8f0' : undefined }} />
                ))}
                <label title="Custom"
                  className="w-full aspect-square rounded-full border-2 border-dashed border-border cursor-pointer
                             flex items-center justify-center text-base text-muted-foreground bg-muted">
                  +
                  <input type="color" className="sr-only" value={options.textColor}
                    onChange={e => updateOption('textColor', e.target.value)} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── TEXT TAB ── */}
        {activeTab === 'text' && (
          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Custom Text</Label>
              <Input value={options.text} onChange={e => updateOption('text', e.target.value)}
                placeholder="Your text…" maxLength={50} className="h-10" />
              <p className="text-[10px] text-muted-foreground text-right">{options.text.length}/50</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Font</Label>
                <Select value={options.fontFamily} onValueChange={v => updateOption('fontFamily', v)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONTS.map(f => (
                      <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Style</Label>
                <div className="flex gap-1">
                  <Toggle pressed={options.bold} onPressedChange={v => updateOption('bold', v)} size="sm" className="flex-1 h-10">
                    <Bold className="h-4 w-4" />
                  </Toggle>
                  <Toggle pressed={options.italic} onPressedChange={v => updateOption('italic', v)} size="sm" className="flex-1 h-10">
                    <Italic className="h-4 w-4" />
                  </Toggle>
                </div>
              </div>
            </div>

            {/* Align + Position */}
            <div className="flex gap-1">
              {([
                { align: 'left'   as TextAlign, Icon: AlignLeft   },
                { align: 'center' as TextAlign, Icon: AlignCenter },
                { align: 'right'  as TextAlign, Icon: AlignRight  },
              ]).map(({ align, Icon }) => (
                <Toggle key={align} pressed={options.textAlign === align}
                  onPressedChange={() => updateOption('textAlign', align)} size="sm" className="flex-1 h-10">
                  <Icon className="h-4 w-4" />
                </Toggle>
              ))}
              <div className="w-px bg-border mx-0.5" />
              {(['top', 'center', 'bottom'] as const).map(pos => (
                <Button key={pos} size="sm"
                  variant={options.textPosition === pos ? 'default' : 'outline'}
                  onClick={() => updateOption('textPosition', pos)}
                  className="flex-1 h-10 text-xs capitalize px-1">{pos}</Button>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs font-semibold">Font Size</Label>
                <span className="text-xs text-muted-foreground">{options.fontSize}px</span>
              </div>
              <Slider min={14} max={60} step={1} value={[options.fontSize]}
                onValueChange={v => updateOption('fontSize', v[0])} />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <RotateCw className="h-3 w-3" /> Rotation
                </Label>
                <span className="text-xs text-muted-foreground">{options.textRotation}°</span>
              </div>
              <Slider min={-45} max={45} step={1} value={[options.textRotation]}
                onValueChange={v => updateOption('textRotation', v[0])} />
            </div>
          </div>
        )}

        {/* ── IMAGE TAB ── */}
        {activeTab === 'image' && (
          <div className="p-4 space-y-3">
            {options.uploadedImage ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted">
                  <img src={options.uploadedImage} alt="Design" className="w-16 h-16 object-contain rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Image added</p>
                    <p className="text-xs text-muted-foreground">Drag on shirt to reposition</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive"
                    onClick={() => updateOption('uploadedImage', null)}>Remove</Button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label className="text-xs font-semibold">Scale</Label>
                    <span className="text-xs text-muted-foreground">{Math.round(options.imageScale * 100)}%</span>
                  </div>
                  <Slider min={40} max={200} step={5} value={[options.imageScale * 100]}
                    onValueChange={v => updateOption('imageScale', v[0] / 100)} />
                </div>
              </>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-2xl p-8
                           flex flex-col items-center gap-3 text-muted-foreground active:bg-muted transition-colors">
                <ImageIcon className="h-12 w-12" />
                <div className="text-center">
                  <p className="text-sm font-semibold">Tap to upload image</p>
                  <p className="text-xs mt-0.5">PNG, JPG, SVG, WEBP</p>
                </div>
              </button>
            )}
          </div>
        )}

        {/* ── ORDER TAB ── */}
        {activeTab === 'order' && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Size</Label>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map(s => (
                  <Button key={s} size="sm"
                    variant={options.size === s ? 'default' : 'outline'}
                    onClick={() => updateOption('size', s)}
                    className="w-12 h-11 text-sm">{s}</Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Quantity</Label>
              <div className="flex items-center gap-3">
                <Button size="icon" variant="outline" className="h-11 w-11"
                  onClick={() => changeQty(-1)} disabled={options.quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-bold text-xl">{options.quantity}</span>
                <Button size="icon" variant="outline" className="h-11 w-11"
                  onClick={() => changeQty(1)} disabled={options.quantity >= 99}>
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="ml-auto text-sm text-muted-foreground">$24.99 each</span>
              </div>
            </div>

            <div className="rounded-xl bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>${(24.99 * options.quantity).toFixed(2)}</span>
              </div>
              {options.quantity >= 3 && (
                <div className="flex justify-between text-green-600 font-medium">
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
              <div className="flex justify-between font-bold text-base">
                <span>Total</span><span>${discountedTotal}</span>
              </div>
            </div>

            <Button className="w-full gap-2 h-12 text-base font-semibold" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5" />
              Add to Cart — ${discountedTotal}
            </Button>
            <Button variant="outline" className="w-full gap-2 h-10" onClick={() => {
              ;(Object.keys(DEFAULT) as (keyof CustomizationOptions)[]).forEach(k => updateOption(k, DEFAULT[k] as never))
              toast.info('Design reset')
            }}>
              <RotateCcw className="h-4 w-4" /> Reset Design
            </Button>
          </div>
        )}

        {/* ── PRESETS TAB ── */}
        {activeTab === 'presets' && (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {PRESETS.map(p => (
                <button key={p.name}
                  onClick={() => {
                    ;(Object.entries(p.opts) as [keyof CustomizationOptions, never][]).forEach(([k, v]) => updateOption(k, v))
                    toast.success(`"${p.name}" applied!`)
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-border
                             active:scale-95 active:bg-accent transition-all text-center">
                  <span className="text-3xl">{p.emoji}</span>
                  <span className="text-xs font-semibold">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
    </div>
  )
}

export default MobileBottomSheet
