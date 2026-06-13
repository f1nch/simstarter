interface HeaderProps {
  onOpenPacks: () => void;
  onGenerate: () => void;
}

function Plumbob() {
  return (
    <svg viewBox="0 0 20 28" className="h-7 w-5" aria-hidden="true">
      <polygon points="10,0 20,14 10,28 0,14" fill="#22c55e" />
      <polygon points="10,4 16.5,14 10,24 3.5,14" fill="#4ade80" />
    </svg>
  );
}

export function Header({ onOpenPacks, onGenerate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-green-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Plumbob />
        <h1 className="text-xl font-extrabold tracking-tight text-green-700">SimStarter</h1>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onOpenPacks}
            className="rounded-full border-2 border-green-300 px-4 py-2 text-sm font-bold text-green-700 transition hover:bg-green-50"
          >
            Packs ⚙
          </button>
          <button
            type="button"
            onClick={onGenerate}
            className="rounded-full bg-green-500 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-green-600 active:scale-95"
          >
            🎲 Generate
          </button>
        </div>
      </div>
    </header>
  );
}
