import { useState } from 'react'
import TShirtCanvas from './TShirtCanvas'
import DesignToolbar from './DesignToolbar'
import PropertiesPanel from './PropertiesPanel'
import MobileBottomSheet from './MobileBottomSheet'
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
    <>
      {/* ── DESKTOP: 3-column Vistaprint layout ── */}
      <div className="hidden md:flex h-[calc(100vh-56px)] overflow-hidden bg-[#f4f5f7]">
        <DesignToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          options={options}
          updateOption={updateOption}
        />
        <TShirtCanvas
          options={options}
          updateOption={updateOption}
          activeTool={activeTool}
        />
        <PropertiesPanel
          options={options}
          updateOption={updateOption}
          totalPrice={totalPrice}
          onAddToCart={onAddToCart}
        />
      </div>

      {/* ── MOBILE: canvas top + fixed bottom panel ── */}
      <div className="flex md:hidden flex-col bg-[#f4f5f7]" style={{ height: '100dvh', paddingTop: 0 }}>
        {/* Canvas — fixed height so bottom sheet is always visible */}
        <div style={{ height: '52dvh', flexShrink: 0 }}>
          <TShirtCanvas
            options={options}
            updateOption={updateOption}
            activeTool={activeTool}
          />
        </div>

        {/* Bottom sheet — fills remaining space */}
        <div style={{ height: '48dvh', flexShrink: 0 }}>
          <MobileBottomSheet
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            options={options}
            updateOption={updateOption}
            totalPrice={totalPrice}
            onAddToCart={onAddToCart}
          />
        </div>
      </div>
    </>
  )
}

export default TShirtCustomizer
