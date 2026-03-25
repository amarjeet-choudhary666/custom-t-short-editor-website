import { useRef, useState, useCallback, useEffect, useId } from 'react'
import type { CustomizationOptions, ActiveTool } from './TShirtCustomizer'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react'
import { toast } from 'sonner'

interface TShirtCanvasProps {
  options: CustomizationOptions
  updateOption: <K extends keyof CustomizationOptions>(k: K, v: CustomizationOptions[K]) => void
  activeTool: ActiveTool
}

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '')
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) }
}
const adj = (hex: string, n: number) => {
  const {r,g,b} = hexToRgb(hex)
  const cl = (v: number) => Math.min(255, Math.max(0, v+n))
  return `rgb(${cl(r)},${cl(g)},${cl(b)})`
}
const rgba = (hex: string, a: number) => {
  const {r,g,b} = hexToRgb(hex)
  return `rgba(${r},${g},${b},${a})`
}

interface DesignOffset { x: number; y: number }

const MIN_ZOOM = 0.4
const MAX_ZOOM = 3.0
const ZOOM_STEP = 0.15

const TShirtCanvas = ({ options, activeTool }: TShirtCanvasProps) => {
  const svgRef      = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Zoom & pan state ──
  const [zoom, setZoom]       = useState(1)
  const [pan,  setPan]        = useState({ x: 0, y: 0 })
  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)
  const [panning, setPanning] = useState(false)

  // ── Design drag state ──
  const [dOffset, setDOffset] = useState<DesignOffset>({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)

  const isFront = options.view === 'front'
  const c       = options.tshirtColor
  const isWhite = c === '#ffffff'

  const hilight = adj(c, isWhite ?  0  :  45)
  const soft    = adj(c, isWhite ? -8  :  18)
  const shade   = adj(c, isWhite ? -18 : -28)
  const deep    = adj(c, isWhite ? -30 : -55)
  const crease  = adj(c, isWhite ? -12 : -40)
  const shadowC = rgba('#000000', isWhite ? 0.06 : 0.18)

  // Every instance gets a unique prefix AND the color is baked into gradient IDs
  // so both desktop+mobile SVGs coexist without ID collisions
  const uid = useId().replace(/:/g, '')
  const gid = c.replace('#', '')
  const ID = {
    drop:    `${uid}_drop`,
    tex:     `${uid}_tex`,
    collarF: `${uid}_collarF`,
    dots:    `${uid}_dots`,
    bodyG:   `${uid}_bodyG_${gid}`,
    bodyV:   `${uid}_bodyV_${gid}`,
    slvL:    `${uid}_slvL_${gid}`,
    slvR:    `${uid}_slvR_${gid}`,
    armL:    `${uid}_armL`,
    armR:    `${uid}_armR`,
    collarG: `${uid}_collarG_${gid}`,
    print:   `${uid}_print`,
  }

  const baseTextY = options.textPosition === 'top' ? 235 : options.textPosition === 'bottom' ? 430 : 330
  const designX   = 250 + dOffset.x
  const designY   = baseTextY + dOffset.y

  // ── Mouse-wheel zoom (cursor-anchored) ──
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const cx = e.clientX - rect.left - rect.width  / 2
    const cy = e.clientY - rect.top  - rect.height / 2
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
    setZoom(prev => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta))
      const scale = next / prev
      setPan(p => ({ x: p.x * scale + cx * (1 - scale), y: p.y * scale + cy * (1 - scale) }))
      return next
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // ── Middle-mouse / space+drag pan ──
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) {
      e.preventDefault()
      setPanning(true)
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
    }
  }, [pan])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (panStart.current) {
      setPan({
        x: panStart.current.px + (e.clientX - panStart.current.mx),
        y: panStart.current.py + (e.clientY - panStart.current.my),
      })
    }
  }, [])

  const onMouseUp = useCallback(() => {
    setPanning(false)
    panStart.current = null
  }, [])

  // ── Design drag (pointer events on SVG group) ──
  const onDesignPointerDown = useCallback((e: React.PointerEvent) => {
    if (activeTool !== 'select') return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: dOffset.x, oy: dOffset.y }
  }, [activeTool, dOffset])

  const onDesignPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const sx = 500 / rect.width
    const sy = 580 / rect.height
    setDOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.mx) * sx / zoom,
      y: dragStart.current.oy + (e.clientY - dragStart.current.my) * sy / zoom,
    })
  }, [zoom])

  const onDesignPointerUp = useCallback(() => {
    setDragging(false)
    dragStart.current = null
  }, [])

  // ── Zoom controls ──
  const zoomIn  = () => setZoom(z => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  // ── Download PNG ──
  const handleDownload = () => {
    const svgEl = svgRef.current
    if (!svgEl) return
    const svgStr = new XMLSerializer().serializeToString(svgEl)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    const img  = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1000; canvas.height = 1160
      canvas.getContext('2d')!.drawImage(img, 0, 0, 1000, 1160)
      URL.revokeObjectURL(url)
      canvas.toBlob(b => {
        if (!b) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(b)
        a.download = 'my-tshirt-design.png'
        a.click()
        toast.success('Design downloaded!')
      }, 'image/png')
    }
    img.src = url
  }

  return (
    <main
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#e8eaed] flex items-center justify-center"
      style={{ cursor: panning ? 'grabbing' : activeTool === 'select' ? 'default' : 'crosshair' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onContextMenu={e => e.preventDefault()}
    >
      {/* ── Dot-grid background (Vistaprint style) ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={ID.dots} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#c8cdd6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${ID.dots})`} />
      </svg>

      {/* ── Zoomed / panned shirt ── */}
      <div
        className="relative"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: panning ? 'none' : 'transform 0.05s ease-out',
          willChange: 'transform',
        }}
      >
        {/* Print-area dashed border hint */}
        <div className="absolute pointer-events-none z-10"
          style={{ top: '29%', left: '22%', width: '56%', height: '62%',
                   border: '1.5px dashed rgba(99,102,241,0.45)', borderRadius: 4 }} />

        <svg
          ref={svgRef}
          viewBox="0 0 500 580"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: 'min(420px, 85vw)', height: 'auto', display: 'block' }}
        >
          <defs>
            <filter id={ID.drop} x="-20%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="rgba(0,0,0,0.22)" />
            </filter>
            <filter id={ID.tex} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.75 0.55" numOctaves="4" stitchTiles="stitch" result="n"/>
              <feColorMatrix type="saturate" values="0" in="n" result="g"/>
              <feBlend in="SourceGraphic" in2="g" mode="multiply" result="b"/>
              <feComposite in="b" in2="SourceGraphic" operator="in"/>
            </filter>
            <filter id={ID.collarF} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.28)" />
            </filter>
            <linearGradient id={ID.bodyG} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={deep}    />
              <stop offset="12%"  stopColor={shade}   />
              <stop offset="30%"  stopColor={soft}    />
              <stop offset="50%"  stopColor={hilight} />
              <stop offset="70%"  stopColor={soft}    />
              <stop offset="88%"  stopColor={shade}   />
              <stop offset="100%" stopColor={deep}    />
            </linearGradient>
            <linearGradient id={ID.bodyV} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="rgba(0,0,0,0)"    />
              <stop offset="60%"  stopColor="rgba(0,0,0,0)"    />
              <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
            </linearGradient>
            <linearGradient id={ID.slvL} x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%"   stopColor={deep}  />
              <stop offset="45%"  stopColor={shade} />
              <stop offset="100%" stopColor={soft}  />
            </linearGradient>
            <linearGradient id={ID.slvR} x1="100%" y1="0%" x2="0%" y2="80%">
              <stop offset="0%"   stopColor={deep}  />
              <stop offset="45%"  stopColor={shade} />
              <stop offset="100%" stopColor={soft}  />
            </linearGradient>
            <linearGradient id={ID.armL} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)"    />
            </linearGradient>
            <linearGradient id={ID.armR} x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)"    />
            </linearGradient>
            <linearGradient id={ID.collarG} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor={shade} />
              <stop offset="100%" stopColor={soft}  />
            </linearGradient>
            <clipPath id={ID.print}>
              <path d="M 175 128 C 195 148 222 158 250 158 C 278 158 305 148 325 128 L 368 144 L 390 168 L 390 530 L 110 530 L 110 168 L 132 144 Z"/>
            </clipPath>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="250" cy="548" rx="175" ry="14" fill="rgba(0,0,0,0.10)" />

          {/* Left sleeve */}
          <path id={`${uid}_slvLPath`} d="M 175 128 C 160 132 142 138 122 146 C 96 156 68 170 52 186 C 44 194 42 204 46 214 C 50 224 60 230 74 228 C 88 226 100 218 110 210 L 110 168 L 132 144 Z"
            fill={`url(#${ID.slvL})`} filter={`url(#${ID.drop})`} />
          <use href={`#${uid}_slvLPath`} fill={c} opacity="0.18" filter={`url(#${ID.tex})`} />
          <path d="M 46 214 C 50 224 60 230 74 228 C 88 226 100 218 110 210 L 108 202 C 98 210 86 218 72 220 C 58 222 50 216 46 214 Z" fill={deep} opacity="0.55" />
          <path d="M 132 148 C 116 162 98 178 82 196" stroke={hilight} strokeWidth="8" fill="none" opacity="0.18" strokeLinecap="round" />
          <path d="M 110 168 L 110 230 L 125 220 L 125 162 Z" fill={`url(#${ID.armL})`} opacity="0.7" />

          {/* Right sleeve */}
          <path id={`${uid}_slvRPath`} d="M 325 128 C 340 132 358 138 378 146 C 404 156 432 170 448 186 C 456 194 458 204 454 214 C 450 224 440 230 426 228 C 412 226 400 218 390 210 L 390 168 L 368 144 Z"
            fill={`url(#${ID.slvR})`} filter={`url(#${ID.drop})`} />
          <use href={`#${uid}_slvRPath`} fill={c} opacity="0.18" filter={`url(#${ID.tex})`} />
          <path d="M 454 214 C 450 224 440 230 426 228 C 412 226 400 218 390 210 L 392 202 C 402 210 414 218 428 220 C 442 222 450 216 454 214 Z" fill={deep} opacity="0.55" />
          <path d="M 368 148 C 384 162 402 178 418 196" stroke={hilight} strokeWidth="8" fill="none" opacity="0.18" strokeLinecap="round" />
          <path d="M 390 168 L 390 230 L 375 220 L 375 162 Z" fill={`url(#${ID.armR})`} opacity="0.7" />

          {/* Body */}
          <path id={`${uid}_bodyPath`} d="M 132 144 L 110 168 C 108 200 106 240 106 280 C 106 360 108 450 110 530 L 390 530 C 392 450 394 360 394 280 C 394 240 392 200 390 168 L 368 144 C 348 152 305 162 250 162 C 195 162 152 152 132 144 Z"
            fill={`url(#${ID.bodyG})`} filter={`url(#${ID.drop})`} />
          <path d="M 132 144 L 110 168 C 108 200 106 240 106 280 C 106 360 108 450 110 530 L 390 530 C 392 450 394 360 394 280 C 394 240 392 200 390 168 L 368 144 C 348 152 305 162 250 162 C 195 162 152 152 132 144 Z"
            fill={`url(#${ID.bodyV})`} />
          <use href={`#${uid}_bodyPath`} fill={c} opacity="0.14" filter={`url(#${ID.tex})`} />

          {/* Creases */}
          <path d="M 148 175 C 146 280 145 390 147 530" stroke={crease} strokeWidth="3" fill="none" opacity="0.25" strokeLinecap="round" />
          <path d="M 352 175 C 354 280 355 390 353 530" stroke={crease} strokeWidth="3" fill="none" opacity="0.25" strokeLinecap="round" />
          <path d="M 250 165 C 249 300 249 420 250 530" stroke={crease} strokeWidth="2" fill="none" opacity="0.12" strokeLinecap="round" />
          <path d="M 120 420 C 180 412 320 412 380 420" stroke={crease} strokeWidth="2" fill="none" opacity="0.15" strokeLinecap="round" />

          {/* Hem */}
          <path d="M 110 530 C 180 534 320 534 390 530 L 390 522 C 320 526 180 526 110 522 Z" fill={deep} opacity="0.35" />
          <path d="M 112 527 C 180 531 320 531 388 527" stroke={deep} strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="7 5" />

          {/* Seams */}
          <path d="M 111 170 L 111 528" stroke={deep} strokeWidth="1" fill="none" opacity="0.2" strokeDasharray="6 5" />
          <path d="M 389 170 L 389 528" stroke={deep} strokeWidth="1" fill="none" opacity="0.2" strokeDasharray="6 5" />
          <path d="M 175 128 C 160 134 145 140 132 144" stroke={deep} strokeWidth="1.5" fill="none" opacity="0.3" />
          <path d="M 325 128 C 340 134 355 140 368 144" stroke={deep} strokeWidth="1.5" fill="none" opacity="0.3" />

          {/* Collar */}
          {isFront ? (
            <g filter={`url(#${ID.collarF})`}>
              <path d="M 175 128 C 195 148 222 158 250 158 C 278 158 305 148 325 128 C 308 108 282 98 250 98 C 218 98 192 108 175 128 Z" fill={`url(#${ID.collarG})`} />
              <path d="M 175 128 C 195 148 222 158 250 158 C 278 158 305 148 325 128" stroke={deep} strokeWidth="2" fill="none" opacity="0.45" />
              <path d="M 175 128 C 192 108 218 98 250 98 C 282 98 308 108 325 128" stroke={deep} strokeWidth="1.5" fill="none" opacity="0.25" />
              <path d="M 205 130 C 225 146 245 152 268 150" stroke={hilight} strokeWidth="4" fill="none" opacity="0.30" strokeLinecap="round" />
              <path d="M 195 136 C 210 150 235 156 255 155" stroke={deep} strokeWidth="1" fill="none" opacity="0.15" strokeLinecap="round" />
            </g>
          ) : (
            <g filter={`url(#${ID.collarF})`}>
              <path d="M 192 122 C 210 134 230 140 250 140 C 270 140 290 134 308 122 C 292 106 272 98 250 98 C 228 98 208 106 192 122 Z" fill={`url(#${ID.collarG})`} />
              <path d="M 192 122 C 210 134 230 140 250 140 C 270 140 290 134 308 122" stroke={deep} strokeWidth="2" fill="none" opacity="0.45" />
              <path d="M 192 122 C 208 106 228 98 250 98 C 272 98 292 106 308 122" stroke={deep} strokeWidth="1.5" fill="none" opacity="0.25" />
            </g>
          )}

          {/* Draggable design */}
          <g
            clipPath={`url(#${ID.print})`}
            style={{ cursor: dragging ? 'grabbing' : activeTool === 'select' ? 'grab' : 'default' }}
            onPointerDown={onDesignPointerDown}
            onPointerMove={onDesignPointerMove}
            onPointerUp={onDesignPointerUp}
            onPointerLeave={onDesignPointerUp}
          >
            <rect x="110" y="168" width="280" height="362" fill="transparent" />
            <g transform={`translate(${designX},${designY}) rotate(${options.textRotation})`}>
              {options.uploadedImage && (
                <image
                  href={options.uploadedImage}
                  x={-90 * options.imageScale}
                  y={-90 * options.imageScale - (options.text ? 24 : 0)}
                  width={180 * options.imageScale}
                  height={180 * options.imageScale}
                  preserveAspectRatio="xMidYMid meet"
                  style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.35))' }}
                />
              )}
              {options.text && (
                <text
                  x={0}
                  y={options.uploadedImage ? 90 * options.imageScale + 12 : 0}
                  textAnchor={options.textAlign === 'left' ? 'start' : options.textAlign === 'right' ? 'end' : 'middle'}
                  dominantBaseline="middle"
                  fill={options.textColor}
                  fontSize={options.fontSize}
                  fontFamily={options.fontFamily}
                  fontWeight={options.bold   ? 'bold'   : 'normal'}
                  fontStyle ={options.italic ? 'italic' : 'normal'}
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.45))' }}
                >
                  {options.text}
                </text>
              )}
            </g>
          </g>

          {/* Edge vignette */}
          <path d="M 132 144 L 110 168 C 108 200 106 240 106 280 C 106 360 108 450 110 530 L 390 530 C 392 450 394 360 394 280 C 394 240 392 200 390 168 L 368 144 C 348 152 305 162 250 162 C 195 162 152 152 132 144 Z"
            fill="none" stroke={shadowC} strokeWidth="18" strokeLinejoin="round" opacity="0.6" />
        </svg>
      </div>

      {/* ── Zoom controls (bottom-centre, Vistaprint style) ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1
                      bg-white rounded-full shadow-lg border border-border px-2 py-1.5">
        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM} title="Zoom out">
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <button
          onClick={resetView}
          className="text-xs font-semibold w-14 text-center hover:text-primary transition-colors"
          title="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM} title="Zoom in">
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={resetView} title="Fit to screen">
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={handleDownload} title="Download PNG">
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ── View badge ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm
                      text-xs font-medium px-3 py-1 rounded-full border border-border shadow-sm capitalize
                      hidden sm:flex items-center gap-1 whitespace-nowrap">
        {options.view} view · scroll to zoom · drag design to move
      </div>
      {/* Mobile hint */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm
                      text-xs font-medium px-3 py-1 rounded-full border border-border shadow-sm capitalize
                      flex sm:hidden items-center gap-1 whitespace-nowrap">
        {options.view} · pinch to zoom
      </div>
    </main>
  )
}

export default TShirtCanvas
