"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Save, RefreshCw, AlertCircle, Check } from "lucide-react";

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
      // Mặc định chọn cái đầu tiên nếu chưa chọn
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

  // 3. Lưu Prompt lên DB
  const handleSave = async () => {
    if (!selectedKey) return;
    setSaving(true);

    const { error } = await supabase
      .from("system_prompts")
      .update({ 
        content: editContent,
        updated_at: new Date().toISOString() 
      })
      .eq("key", selectedKey);

    if (error) {
      alert("Failed to save: " + error.message);
    } else {
      // Cập nhật lại list local
      setPrompts(prompts.map(p => p.key === selectedKey ? { ...p, content: editContent } : p));
      alert("✅ Prompt updated successfully!");
    }
    setSaving(false);
  };

  const selectedPrompt = prompts.find(p => p.key === selectedKey);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">System Prompts</h1>
           <p className="text-slate-500">Edit how AI behaves. Changes apply immediately.</p>
        </div>
        <button 
            onClick={fetchPrompts} 
            className="p-2 text-slate-500 hover:bg-white rounded-lg transition-colors"
            title="Refresh"
        >
            <RefreshCw size={20} />
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* LIST CỘT TRÁI */}
        <div className="w-1/3 bg-white rounded-2xl border border-slate-200 overflow-y-auto shadow-sm">
            {loading ? (
                <div className="p-4 text-center text-slate-400">Loading prompts...</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {prompts.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => selectPrompt(p)}
                            className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                                selectedKey === p.key ? "bg-indigo-50 border-l-4 border-indigo-500" : "border-l-4 border-transparent"
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
        <div className="w-2/3 flex flex-col gap-4">
            {selectedPrompt ? (
                <>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col relative">
                         <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Prompt Content Editor</span>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                Supports placeholders like {"{{input_text}}"}
                            </span>
                         </div>
                         <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="flex-1 w-full resize-none outline-none font-mono text-sm leading-relaxed text-slate-700"
                            spellCheck={false}
                         />
                         
                         {/* Save Button Floating */}
                         <div className="absolute bottom-4 right-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                         </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-amber-800 text-sm">
                        <AlertCircle size={20} className="shrink-0"/>
                        <p>
                            <strong>Warning:</strong> Changing prompts affects all users immediately. 
                            Ensure you keep the JSON structure and required placeholders (e.g. <code>{`{{input_text}}`}</code>) intact.
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