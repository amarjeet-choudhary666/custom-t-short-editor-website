import { useState } from 'react'
import TShirtCanvas from './TShirtCanvas'
import DesignToolbar from './DesignToolbar'
import PropertiesPanel from './PropertiesPanel'
import type { CartItem } from '@/hooks/useCart'

export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type TextAlign = 'left' | 'center' | 'right'
export type ViewSide = 'front' | 'back'
export type ActiveTool = 'select' | 'text' | 'image'

export interface CustomizationOptions {
  text: string
  fontSize: number
  textColor: string
  tshirtColor: string
  fontFamily: string
  textPosition: 'center' | 'top' | 'bottom'
  bold: boolean
  italic: boolean
  textAlign: TextAlign
  size: TShirtSize
  quantity: number
  view: ViewSide
  uploadedImage: string | null
  imageScale: number
  textRotation: number
}

const PRICE_BASE = 24.99

interface TShirtCustomizerProps {
  onAddToCart: (options: CustomizationOptions) => CartItem
}

const TShirtCustomizer = ({ onAddToCart }: TShirtCustomizerProps) => {
  const [options, setOptions] = useState<CustomizationOptions>({
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
  })

  const [activeTool, setActiveTool] = useState<ActiveTool>('select')

  const updateOption = <K extends keyof CustomizationOptions>(
    key: K,
    value: CustomizationOptions[K]
  ) => setOptions(prev => ({ ...prev, [key]: value }))

  const totalPrice = (PRICE_BASE * options.quantity).toFixed(2)

  return (
    /* Vistaprint-style: full-width editor with left toolbar + centre canvas + right panel */
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-[#f4f5f7]">

      {/* ── Left toolbar ── */}
      <DesignToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        options={options}
        updateOption={updateOption}
      />

      {/* ── Centre canvas ── */}
      <TShirtCanvas
        options={options}
        updateOption={updateOption}
        activeTool={activeTool}
      />

      {/* ── Right properties panel ── */}
      <PropertiesPanel
        options={options}
        updateOption={updateOption}
        totalPrice={totalPrice}
        onAddToCart={onAddToCart}
      />
    </div>
  )
}

export default TShirtCustomizer
