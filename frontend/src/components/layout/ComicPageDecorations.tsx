export default function ComicPageDecorations() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* =========================================================================
          TOP-LEFT CORNER: Comic registration marks & angled speed stripes
          ========================================================================= */}
      <div className="absolute -left-12 -top-12 opacity-[0.06] transition-opacity duration-500 hover:opacity-[0.1]">
        {/* Large angled comic polygon backdrop */}
        <svg width="420" height="420" viewBox="0 0 420 420" fill="none">
          <polygon
            points="0,0 360,0 280,180 0,360"
            fill="#e5a93c"
            stroke="#0e0917"
            strokeWidth="3"
          />
          {/* Halftone dot cluster inside polygon */}
          <pattern id="corner-dots-tl" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="2.5" fill="#581c87" />
          </pattern>
          <polygon points="40,40 300,40 240,160 40,280" fill="url(#corner-dots-tl)" />
        </svg>
      </div>

      {/* Top-left registration cross and comic telemetry stamp */}
      <div className="absolute left-6 top-24 hidden lg:flex flex-col gap-1 opacity-[0.14] text-[#e5a93c] font-display text-[9px] font-black tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">⌜</span>
          <span>SEC // 01</span>
        </div>
        <div className="flex gap-1 pl-1">
          <span className="inline-block h-1 w-3 bg-[#e5a93c]" />
          <span className="inline-block h-1 w-1 bg-[#e5a93c]" />
          <span className="inline-block h-1 w-1 bg-[#e5a93c]" />
        </div>
      </div>

      {/* =========================================================================
          TOP-RIGHT CORNER: Comic wireframe diamond & Ben-Day pattern
          ========================================================================= */}
      <div className="absolute -right-16 -top-16 opacity-[0.05]">
        <svg width="460" height="460" viewBox="0 0 460 460" fill="none">
          <circle cx="230" cy="230" r="180" stroke="#e5a93c" strokeWidth="2.5" strokeDasharray="6 6" />
          <polygon
            points="230,20 440,230 230,440 20,230"
            stroke="#a855f7"
            strokeWidth="3"
            fill="none"
          />
          <polygon
            points="230,70 390,230 230,390 70,230"
            stroke="#e5a93c"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Concentric diamond center */}
          <polygon points="230,130 330,230 230,330 130,230" fill="#581c87" fillOpacity="0.4" />
        </svg>
      </div>

      {/* Top-right comic coordinate stamp */}
      <div className="absolute right-8 top-24 hidden lg:flex flex-col items-end gap-1 opacity-[0.14] text-[#a855f7] font-display text-[9px] font-black tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span>SYS // 9.8</span>
          <span className="text-base leading-none">⌝</span>
        </div>
        <div className="flex gap-1 pr-1">
          <span className="inline-block h-1 w-1 bg-[#a855f7]" />
          <span className="inline-block h-1 w-1 bg-[#a855f7]" />
          <span className="inline-block h-1 w-4 bg-[#a855f7]" />
        </div>
      </div>

      {/* =========================================================================
          LEFT MARGIN: Floating comic crosses, chevrons, and speed tick marks
          ========================================================================= */}
      <div className="absolute left-4 top-1/3 hidden xl:flex flex-col gap-8 opacity-[0.12] text-[#e5a93c]">
        <span className="font-display text-sm font-black">+</span>
        <div className="flex flex-col gap-1 pl-1">
          <span className="h-4 w-1 bg-[#e5a93c]" />
          <span className="h-2 w-1 bg-[#e5a93c]" />
          <span className="h-6 w-1 bg-[#e5a93c]" />
        </div>
        <span className="font-display text-xs font-black">◆</span>
        <span className="font-display text-sm font-black">+</span>
      </div>

      {/* =========================================================================
          RIGHT MARGIN: Comic Ben-Day halftone matrix block
          ========================================================================= */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:block opacity-[0.08]">
        <svg width="64" height="240" viewBox="0 0 64 240" fill="none">
          {Array.from({ length: 15 }).map((_, rowIndex) =>
            Array.from({ length: 4 }).map((_, colIndex) => (
              <circle
                key={`${rowIndex}-${colIndex}`}
                cx={colIndex * 16 + 8}
                cy={rowIndex * 16 + 8}
                r={colIndex % 2 === 0 ? 2.5 : 1.5}
                fill={rowIndex % 3 === 0 ? '#e5a93c' : '#a855f7'}
              />
            ))
          )}
        </svg>
      </div>

      {/* Floating right chevron marker */}
      <div className="absolute right-4 top-2/3 hidden xl:flex flex-col gap-6 opacity-[0.12] text-[#a855f7] font-display text-xs font-black">
        <span>»»</span>
        <span>◆</span>
        <span>+</span>
      </div>

      {/* =========================================================================
          BOTTOM-LEFT: Comic chevron speed stripes & corner registration
          ========================================================================= */}
      <div className="absolute -bottom-14 -left-14 opacity-[0.05]">
        <svg width="380" height="380" viewBox="0 0 380 380" fill="none">
          {/* Angled speed bars */}
          <line x1="0" y1="380" x2="380" y2="0" stroke="#e5a93c" strokeWidth="8" />
          <line x1="40" y1="380" x2="380" y2="40" stroke="#e5a93c" strokeWidth="4" />
          <line x1="80" y1="380" x2="380" y2="80" stroke="#581c87" strokeWidth="12" />
          <line x1="130" y1="380" x2="380" y2="130" stroke="#a855f7" strokeWidth="3" strokeDasharray="8 8" />
          <line x1="170" y1="380" x2="380" y2="170" stroke="#e5a93c" strokeWidth="6" />
        </svg>
      </div>

      <div className="absolute bottom-10 left-6 hidden lg:flex items-center gap-2 opacity-[0.14] text-[#e5a93c] font-display text-[9px] font-black uppercase tracking-widest">
        <span className="text-base leading-none">⌞</span>
        <span>MK // VAULT GRID</span>
      </div>

      {/* =========================================================================
          BOTTOM-RIGHT: Comic corner bracket & barcode accent
          ========================================================================= */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.05]">
        <svg width="360" height="360" viewBox="0 0 360 360" fill="none">
          <circle cx="360" cy="360" r="260" stroke="#a855f7" strokeWidth="2" strokeDasharray="12 12" />
          <circle cx="360" cy="360" r="180" stroke="#e5a93c" strokeWidth="3" />
          <circle cx="360" cy="360" r="100" fill="#581c87" fillOpacity="0.3" stroke="#0e0917" strokeWidth="2" />
        </svg>
      </div>

      <div className="absolute bottom-10 right-6 hidden lg:flex items-center gap-2 opacity-[0.14] text-[#a855f7] font-display text-[9px] font-black uppercase tracking-widest">
        <span>TERM // END</span>
        <span className="text-base leading-none">⌟</span>
      </div>
    </div>
  );
}
