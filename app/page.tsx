"use client";

import { useState } from "react";
import { Copy, AlertCircle, Waypoints, Zap, Link as LucideLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TreeViewer = ({ node, treeObj }: { node: string; treeObj: any }) => {
  const children = Object.keys(treeObj);
  if (children.length === 0) return null;

  return (
    <ul className="pl-6 mt-3 space-y-3 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-white/10">
      {children.map((child) => (
        <li key={child} className="relative">
          <div className="flex items-center gap-3 before:content-[''] before:absolute before:-left-6 before:top-[14px] before:w-4 before:h-px before:bg-white/20">
            <div className="h-7 w-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold shadow-lg text-white">
              {child}
            </div>
            {Object.keys(treeObj[child]).length === 0 ? (
              <span className="text-white/40 text-xs italic">leaf</span>
            ) : null}
          </div>
          <TreeViewer node={child} treeObj={treeObj[child]} />
        </li>
      ))}
    </ul>
  );
};

export default function App() {
  const [inputVal, setInputVal] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError("");
    setLoading(true);

    try {
      const parsedArray = inputVal
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter((s) => s !== "");

      const res = await fetch("/api/bfhl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsedArray }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to process");
      
      setResult(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans tracking-tight pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-neutral-950 to-neutral-950 pointer-events-none" />
      
      <main className="relative max-w-4xl mx-auto pt-24 px-6">
        <header className="mb-12 cursor-default">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-blue-300 font-medium mb-4">
            <Zap className="w-3 h-3" /> API Route Active
          </div>
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              BFHL Hierarchy Engine
            </h1>
          </div>
          <p className="text-white/50 text-lg">Process relationships logically into deterministic directed cyclic structures.</p>
        </header>

        <form onSubmit={handleSubmit} className="mb-12 rounded-2xl bg-white/5 border border-white/10 p-2 shadow-2xl backdrop-blur-sm">
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder='e.g. A->B, A->C, B->D'
            className="w-full bg-transparent resize-none p-4 min-h-[120px] text-lg focus:outline-none placeholder:text-white/20 text-white/90"
            required
          />
          <div className="border-t border-white/10 p-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black px-6 py-2 rounded-xl font-semibold transition-all hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? "Processing..." : "Generate Network"}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard title="Total Valid Trees" value={result.summary.total_trees} />
                 <StatCard title="Total Cycles Detected" value={result.summary.total_cycles} isWarning={result.summary.total_cycles > 0} />
                 <StatCard title="Deepest Tree Root" value={result.summary.largest_tree_root || "N/A"} highlight />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(result.invalid_entries?.length > 0) && (
                   <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                     <h3 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                       <AlertCircle className="w-4 h-4" /> Invalid Entries Skipped ({result.invalid_entries.length})
                     </h3>
                     <p className="text-orange-300/80 font-mono text-sm break-all">{result.invalid_entries.join(", ")}</p>
                   </div>
                 )}
                 {(result.duplicate_edges?.length > 0) && (
                   <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                     <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                       <LucideLink className="w-4 h-4" /> Duplicate Edges Ignored ({result.duplicate_edges.length})
                     </h3>
                     <p className="text-yellow-300/80 font-mono text-sm break-all">{result.duplicate_edges.join(", ")}</p>
                   </div>
                 )}
              </div>

              {/* JSON Info Block */}
              <div className="p-5 rounded-2xl flex flex-col gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-200">
                  <div className="flex flex-col md:flex-row gap-4 items-center font-mono text-xs w-full justify-between tracking-wide">
                     <p><b>user_id:</b> {result.user_id}</p>
                     <p><b>email_id:</b> {result.email_id}</p>
                     <p><b>roll_number:</b> {result.college_roll_number}</p>
                  </div>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0A0A0A]">
                 <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex gap-2 items-center">
                    <Waypoints className="w-5 h-5 text-sky-400" />
                    <h2 className="font-semibold text-white/90">Component Hierarchies</h2>
                 </div>
                 
                 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {result.hierarchies.length === 0 && <span className="text-white/40 italic">No valid components</span>}
                    {result.hierarchies.map((h: any, idx: number) => (
                      <div key={idx} className="p-5 rounded-xl border border-white/5 bg-white/[0.02] shadow-inner">
                         <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                            <h3 className="font-bold flex items-center gap-3">
                              Root: <span className="bg-white/10 text-white px-2 py-0.5 rounded border border-white/20">{h.root}</span>
                            </h3>
                            {h.has_cycle ? (
                               <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded font-medium border border-red-500/30 w-fit">Cyclic</span>
                            ) : (
                               <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-300 rounded font-medium border border-emerald-500/20 w-fit">Depth {h.depth}</span>
                            )}
                         </div>

                         {!h.has_cycle && h.tree[h.root] ? (
                            <div className="font-mono text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                                  {h.root}
                                </div>
                              </div>
                              <TreeViewer node={h.root} treeObj={h.tree[h.root]} />
                            </div>
                         ) : (
                           <div className="text-white/40 italic text-sm">Cyclic group, rendering detached.</div>
                         )}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="w-full flex rounded-2xl overflow-hidden border border-white/10 text-white p-6 bg-black/40">
                  <div className="text-xs font-mono text-white/50 w-full whitespace-pre-wrap break-all custom-scrollbar overflow-x-auto opacity-70">
                      {JSON.stringify(result, null, 2)}
                  </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const StatCard = ({ title, value, highlight, isWarning }: any) => (
  <div className={`p-6 rounded-2xl border bg-white/5 backdrop-blur-sm ${
    highlight ? "border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.15)]" : 
    isWarning ? "border-red-500/30" : "border-white/10"
  }`}>
    <h3 className="text-white/50 text-sm font-medium mb-1">{title}</h3>
    <p className={`text-4xl tracking-tighter font-bold ${highlight ? "text-sky-400" : isWarning ? "text-red-400" : "text-white"}`}>{value}</p>
  </div>
);
