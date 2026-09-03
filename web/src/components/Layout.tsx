import { ConnectKitButton } from "connectkit";
import { Trophy, Plus } from "lucide-react";

type View = { type: "list" } | { type: "detail"; marketId: bigint } | { type: "create" };

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: View) => void;
  currentView: View;
}

export default function Layout({ children, onNavigate, currentView }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition" onClick={() => onNavigate({ type: "list" })}>
            <Trophy className="w-6 h-6 text-ritual-400" />
            <h1 className="text-xl font-bold text-ritual-400">Ritual Predict</h1>
          </div>
          <div className="flex items-center gap-3">
            {currentView.type !== "create" && (
              <button onClick={() => onNavigate({ type: "create" })} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ritual-600 hover:bg-ritual-500 transition text-sm font-medium">
                <Plus className="w-4 h-4" /> New Market
              </button>
            )}
            <ConnectKitButton />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
