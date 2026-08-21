interface RokberPreviewProps {
  image: string;
}

export default function RokberPreview({ image }: RokberPreviewProps) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-zinc-950" aria-hidden="true">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55" />

      <div className="absolute inset-x-0 top-0 bg-zinc-950/95 text-white shadow-lg">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <div className="shrink-0">
            <div className="text-sm font-black tracking-[0.08em] sm:text-lg">ROKBER</div>
            <div className="hidden text-[7px] font-semibold tracking-[0.24em] text-zinc-400 sm:block">
              ROKAM, BERAM UN TRANSPORTĒJAM
            </div>
          </div>
          <div className="hidden items-center gap-5 text-[8px] font-bold tracking-[0.12em] text-zinc-300 sm:flex md:text-[9px]">
            <span className="text-yellow-400">SĀKUMS</span>
            <span>ZEMES DARBI</span>
            <span>BERAMKRAVAS</span>
            <span>TEHNIKAS NOMA</span>
          </div>
        </div>
        <div
          className="h-1.5"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #facc15 0, #facc15 12px, #18181b 12px, #18181b 24px)',
          }}
        />
      </div>

      <div className="absolute left-4 top-24 sm:left-7 sm:top-28">
        <span className="rounded border border-yellow-300/50 bg-black/55 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.2em] text-yellow-300 backdrop-blur-sm sm:text-[9px]">
          rokber.lv
        </span>
      </div>
    </div>
  );
}
