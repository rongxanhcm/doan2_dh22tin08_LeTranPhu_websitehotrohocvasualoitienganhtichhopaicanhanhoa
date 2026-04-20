"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Save, RefreshCw, AlertCircle, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function PromptsManager() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  
  const supabase = createClient();

  // 1. Fetch danh sách Prompts
  const fetchPrompts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("system_prompts")
      .select("*")
      .order("key");
    
    if (error) alert("Error fetching prompts");
    else {
      setPrompts(data || []);
      if (!selectedKey && data && data.length > 0) {
        selectPrompt(data[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchPrompts(); }, []);

  // 2. Chọn Prompt để sửa
  const selectPrompt = (prompt: any) => {
    setSelectedKey(prompt.key);
    setEditContent(prompt.content);
  };

  // 3. Lưu Prompt lên DB & CLEAR CACHE SERVER (Luồng Demo Đồ Án)
  const handleSave = async () => {
    if (!selectedKey) return;
    setSaving(true);

    // Bước 3.1: Lưu vào Database Supabase
    const { error } = await supabase
      .from("system_prompts")
      .update({ 
        content: editContent,
        updated_at: new Date().toISOString() 
      })
      .eq("key", selectedKey);

    if (error) {
      toast.error("Failed to save: " + error.message);
      setSaving(false);
      return;
    }

    // Bước 3.2: Lấy Token và gọi API Clear Cache của FastAPI
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        const res = await fetch(`${API_URL}/admin/clear-cache`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session?.access_token}`
            }
        });

        if (res.ok) {
            // Cập nhật lại list local
            setPrompts(prompts.map(p => p.key === selectedKey ? { ...p, content: editContent } : p));
            toast.success("Saved & Cache Cleared");
        } else {
            const errData = await res.json();
            toast.error("Saved to DB, but Cache failed: " + errData.detail);
        }
    } catch (err) {
        console.error(err);
        toast.error("Saved to DB, but couldn't reach API Server to clear cache.");
    }
    
    setSaving(false);
  };

  const selectedPrompt = prompts.find(p => p.key === selectedKey);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Prompts</h1>
           <p className="text-slate-500 font-medium">Edit how AI behaves. Changes apply immediately.</p>
        </div>
        <button 
            onClick={fetchPrompts} 
            className="p-2 text-slate-500 hover:bg-white rounded-lg transition-colors border border-slate-200 shadow-sm self-start sm:self-auto"
            title="Refresh"
        >
            <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                            {/* LIST CỘT TRÁI */}
        <div className="lg:w-1/3 bg-white rounded-2xl border border-slate-200 overflow-y-auto shadow-lg shadow-slate-200/50 max-h-[300px] lg:max-h-none">
            {loading ? (
                <div className="p-4 text-center text-slate-500 font-medium">Loading prompts...</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {prompts.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => selectPrompt(p)}
                            className={`w-full text-left p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50/30 transition-all ${
                                selectedKey === p.key ? "bg-gradient-to-r from-cyan-50 to-cyan-100 border-l-4 border-cyan-500 shadow-sm" : "border-l-4 border-transparent"
                            }`}
                        >
                            <div className="font-bold text-slate-800 font-mono text-sm">{p.key}</div>
                            <div className="text-xs text-slate-500 mt-1 line-clamp-1">{p.description}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
        {/* EDITOR CỘT PHẢI */}
        <div className="lg:w-2/3 flex flex-col gap-4 flex-1">
            {selectedPrompt ? (
                <>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 flex-1 flex flex-col relative min-h-[400px]">
                         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Prompt Content Editor</span>
                            <span className="text-xs text-slate-500 bg-gradient-to-r from-slate-100 to-cyan-50 px-2 py-1 rounded border border-slate-200">
                                Supports placeholders like {"{{input_text}}"}
                            </span>
                         </div>
                         <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="flex-1 w-full resize-none outline-none font-mono text-sm leading-relaxed text-slate-700 mb-16 custom-scrollbar"
                            spellCheck={false}
                         />
                         
                         {/* Save Button Floating */}
                         <div className="absolute bottom-4 right-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>}
                                {saving ? "Saving & Syncing..." : "Save & Clear Cache"}
                            </button>
                         </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200 flex gap-3 text-amber-800 text-sm shadow-sm">
                        <AlertCircle size={20} className="shrink-0"/>
                        <p>
                            <strong className="font-bold">Warning:</strong> Changing prompts affects all users immediately. 
                            Ensure you keep the JSON structure and required placeholders (e.g. <code className="bg-amber-200/50 px-1 rounded">{`{{input_text}}`}</code>) intact.
                        </p>
                    </div>
                </>
            ) : (
                <div className="flex-1 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    Select a prompt to edit
                </div>
            )}
        </div>
      </div>
    </div>
  );
}