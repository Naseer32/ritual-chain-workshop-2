import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import MarketList from "./components/MarketList";
import MarketDetail from "./components/MarketDetail";
import CreateMarket from "./components/CreateMarket";

type View = { type: "list" } | { type: "detail"; marketId: bigint } | { type: "create" };

export default function App() {
  const [view, setView] = useState<View>({ type: "list" });

  return (
    <Layout onNavigate={setView} currentView={view}>
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1f2937", color: "#f3f4f6", border: "1px solid rgba(255,255,255,0.1)" }
      }} />
      {view.type === "list" && (
        <MarketList onSelectMarket={(id) => setView({ type: "detail", marketId: id })} onCreate={() => setView({ type: "create" })} />
      )}
      {view.type === "detail" && <MarketDetail marketId={view.marketId} onBack={() => setView({ type: "list" })} />}
      {view.type === "create" && <CreateMarket onSuccess={() => setView({ type: "list" })} onCancel={() => setView({ type: "list" })} />}
    </Layout>
  );
}
