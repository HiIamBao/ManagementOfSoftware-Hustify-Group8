"use client";

export function StickyFooter() {
  return (
    <div style={{ position: 'sticky', top: '60px', zIndex: 10 }}>
      <div className="w-full flex flex-col items-center text-xs text-muted-foreground py-2 mt-8">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mb-1">
          <span>About</span>
          <span>Accessibility</span>
          <span>Help Center</span>
          <span>Privacy & Terms <span aria-hidden>▼</span></span>
          <span>Ad Choices</span>
          <span>Advertising</span>
          <span>Business Services <span aria-hidden>▼</span></span>
          <span>Get the Hustify app</span>
          <span>More</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold text-[#b10000]">H</span>
          <span className="font-bold text-[#b10000]">u</span>
          <span className="font-bold text-[#b10000]">s</span>
          <span className="font-bold text-[#b10000]">t</span>
          <span className="font-bold text-[#b10000]">i</span>
          <span className="font-bold text-[#b10000]">f</span>
          <span className="font-bold text-[#b10000]">y</span>
          <span className="ml-1"> © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
} 