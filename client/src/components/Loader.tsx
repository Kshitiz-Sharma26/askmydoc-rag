import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-4 p-8 bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl border border-white/50 animate-in zoom-in-95 duration-200">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-700 font-medium">Loading...</p>
      </div>
    </div>
  );
}
