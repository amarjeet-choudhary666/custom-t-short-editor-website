import type { ActiveTool, CustomizationOptions } from './TShirtCustomizer'
import { useRef } from 'react'
import { Separator } from '@/components/ui/separator'
import {
  MousePointer2, Type, ImageIcon, Layers,
} from 'lucide-react'
import { toast } from 'sonner'

interface DesignToolbarProps {
  activeTool: ActiveTool
  setActiveTool: (t: ActiveTool) => void
  options: CustomizationOptions
  updateOption: <K extends keyof CustomizationOptions>(k: K, v: CustomizationOptions[K]) => void
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

const tools = [
  { id: 'select' as ActiveTool, Icon: MousePointer2, label: 'Select' },
  { id: 'text'   as ActiveTool, Icon: Type,          label: 'Text'   },
  { id: 'image'  as ActiveTool, Icon: ImageIcon,     label: 'Image'  },
]

const DesignToolbar = ({ activeTool, setActiveTool, options, updateOption }: DesignToolbarProps) => {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      updateOption('uploadedImage', ev.target?.result as string)
      toast.success('Image added to design')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <aside className="w-16 bg-white border-r flex flex-col items-center py-3 gap-1 shrink-0 shadow-sm z-10">
      {/* Tools */}
      {tools.map(({ id, Icon, label }) => (
        <button
          key={id}
          title={label}
          onClick={() => {
            if (id === 'image') { fileRef.current?.click(); return }
            setActiveTool(id)
          }}
          className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center gap-0.5
                      text-[10px] font-medium transition-colors
                      ${activeTool === id && id !== 'image'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      ))}

      <Separator className="my-2 w-8" />

      {/* Shirt colour swatches */}
      <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Color</p>
      <div className="flex flex-col gap-1.5 items-center overflow-y-auto max-h-64 scrollbar-none">
        {TSHIRT_COLORS.map(col => (
          <button
            key={col.value}
            title={col.name}
            onClick={() => updateOption('tshirtColor', col.value)}
            className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110
              ${options.tshirtColor === col.value
                ? 'border-primary ring-2 ring-primary/30 scale-110'
                : 'border-border'}`}
            style={{ backgroundColor: col.value }}
          />
        ))}
        {/* custom */}
        <label title="Custom color"
          className="w-7 h-7 rounded-full border-2 border-dashed border-border cursor-pointer
                     flex items-center justify-center text-[11px] text-muted-foreground
                     hover:border-primary transition">
          +
          <input type="color" className="sr-only" value={options.tshirtColor}
            onChange={e => updateOption('tshirtColor', e.target.value)} />
        </label>
      </div>

      {/* hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />

      <Separator className="my-2 w-8" />

      {/* View toggle */}
      <button
        title="Front / Back"
        onClick={() => updateOption('view', options.view === 'front' ? 'back' : 'front')}
        className="w-11 h-11 rounded-lg flex flex-col items-center justify-center gap-0.5
                   text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
      >
        <Layers className="h-5 w-5" />
        {options.view === 'front' ? 'Front' : 'Back'}
      </button>
    </aside>
  )
}

export default DesignToolbar
