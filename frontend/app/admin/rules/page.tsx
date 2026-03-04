"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { 
  Plus, Edit, Trash2, Search, X, Save, BookOpen 
} from "lucide-react";
import toast from "react-hot-toast";
// Kiểu dữ liệu cho Form
interface RuleFormData {
  id?: number;
  error_key: string;
  title: string;
  definition: string;
  rule: string;
  bad_example: string;
  good_example: string;
  tip: string;
}

const EMPTY_FORM: RuleFormData = {
  error_key: "",
  title: "",
  definition: "",
  rule: "",
  bad_example: "",
  good_example: "",
  tip: ""
};

export default function RulesManager() {
  const [rules, setRules] = useState<RuleFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<RuleFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  // 1. FETCH DATA
  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("grammar_rules")
      .select("*")
      .order("id", { ascending: true }); // Sắp xếp theo ID

    if (error) toast.error("Failed to load rules: " + error.message);
    else setRules(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();

    // Subscribe to real-time changes on grammar_rules table
    const subscription = supabase
      .channel('grammar_rules_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'grammar_rules' },
        () => {
          fetchRules();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // 2. HANDLE OPEN MODAL
  const handleEdit = (rule: RuleFormData) => {
    setFormData(rule);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  // 3. HANDLE SAVE (CREATE & UPDATE)
  const handleSave = async () => {
    if (!formData.error_key || !formData.title) {
        toast.error("Key and Title are required.");
        return;
    }
    setSaving(true);
    toast.success("Saved successfully!");

    let error;
    if (formData.id) {
        // UPDATE
        const { error: updateErr } = await supabase
            .from("grammar_rules")
            .update({
                error_key: formData.error_key,
                title: formData.title,
                definition: formData.definition,
                rule: formData.rule,
                bad_example: formData.bad_example,
                good_example: formData.good_example,
                tip: formData.tip
            })
            .eq("id", formData.id);
        error = updateErr;
    } else {
        // CREATE
        const { error: insertErr } = await supabase
            .from("grammar_rules")
            .insert([{
                error_key: formData.error_key,
                title: formData.title,
                definition: formData.definition,
                rule: formData.rule,
                bad_example: formData.bad_example,
                good_example: formData.good_example,
                tip: formData.tip
            }]);
        error = insertErr;
    }

    if (error) {
        toast.error("Save failed: " + error.message);
    } else {
        fetchRules(); // Refresh list
        setIsModalOpen(false);
    }
    setSaving(false);
  };

  // 4. HANDLE DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Not authenticated");
        return;
      }

      // Call backend endpoint
      const response = await fetch("http://localhost:8000/delete-grammar-rule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ rule_id: id })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Delete error:", data);
        toast.error(data.detail || "Delete failed");
        return;
      }

      console.log("Delete successful:", data);
      toast.success("Rule deleted successfully!");
      await fetchRules();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed: " + String(error));
    }
  };

  // Filter Search
  const filteredRules = rules.filter(r => 
    r.error_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Grammar Rules</h1>
           <p className="text-slate-500 font-medium">Manage educational content for users.</p>
        </div>
        <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all shadow-lg shadow-cyan-500/30 self-start sm:self-auto"
        >
            <Plus size={20} /> Add New Rule
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
         <input 
            type="text" 
            placeholder="Search rules by key or title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none shadow-sm transition-shadow"
         />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
         {/* Desktop view */}
         <div className="hidden md:block overflow-x-auto">
           <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-slate-50 to-cyan-50/30 border-b border-slate-200">
                <tr>
                    <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wide">Error Key (Backend)</th>
                    <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wide">Title (Display)</th>
                    <th className="p-4 font-bold text-slate-600 text-sm uppercase tracking-wide">Example</th>
                    <th className="p-4 font-bold text-slate-600 text-sm text-right uppercase tracking-wide">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">Loading data...</td></tr>
                ) : filteredRules.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No rules found.</td></tr>
                ) : (
                    filteredRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50/20 transition-all group">
                            <td className="p-4 font-mono text-sm font-bold text-cyan-600">{rule.error_key}</td>
                            <td className="p-4 font-semibold text-slate-800">{rule.title}</td>
                            <td className="p-4 text-sm text-slate-500 truncate max-w-xs">{rule.good_example}</td>
                            <td className="p-4 text-right flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(rule)} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all" title="Edit">
                                    <Edit size={18}/>
                                </button>
                                <button onClick={() => handleDelete(rule.id!)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                    <Trash2 size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
         </table>
         </div>

         {/* Mobile view - Card based */}
         <div className="md:hidden divide-y divide-slate-100">
            {loading ? (
                <div className="p-8 text-center text-slate-500 font-medium">Loading data...</div>
            ) : filteredRules.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">No rules found.</div>
            ) : (
                filteredRules.map((rule) => (
                    <div key={rule.id} className="p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-cyan-50/20 transition-all">
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Error Key</div>
                                <div className="font-mono text-sm font-bold text-cyan-600">{rule.error_key}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Title</div>
                                <div className="font-semibold text-slate-800">{rule.title}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Example</div>
                                <div className="text-sm text-slate-500">{rule.good_example}</div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button 
                                    onClick={() => handleEdit(rule)} 
                                    className="flex-1 flex items-center justify-center gap-2 p-2.5 text-cyan-600 border border-cyan-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-cyan-100 rounded-lg transition-all font-bold text-sm"
                                >
                                    <Edit size={16}/> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(rule.id!)} 
                                    className="flex-1 flex items-center justify-center gap-2 p-2.5 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-all font-bold text-sm"
                                >
                                    <Trash2 size={16}/> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
         </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {formData.id ? <Edit className="text-cyan-500"/> : <Plus className="text-emerald-500"/>}
                        {formData.id ? "Edit Grammar Rule" : "Create New Rule"}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24}/>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Error Key (Unique)</label>
                            <input 
                                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-sm transition-shadow"
                                placeholder="e.g. Past Tense"
                                value={formData.error_key}
                                onChange={e => setFormData({...formData, error_key: e.target.value})}
                            />
                            <p className="text-[10px] text-slate-400">Must match exactly with Gemini output key.</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Title (Display)</label>
                            <input 
                                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition-shadow"
                                placeholder="e.g. Thì Quá khứ đơn"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Definition</label>
                        <textarea 
                            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none resize-none h-20 transition-shadow"
                            placeholder="Explain what this error is..."
                            value={formData.definition}
                            onChange={e => setFormData({...formData, definition: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Rule (The Fix)</label>
                        <div className="flex gap-2">
                            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-2 rounded text-cyan-600 flex-shrink-0"><BookOpen size={20}/></div>
                            <input 
                                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none font-bold text-cyan-900 transition-shadow"
                                placeholder="The golden rule to fix it..."
                                value={formData.rule}
                                onChange={e => setFormData({...formData, rule: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-red-500 uppercase">Bad Example</label>
                            <input 
                                className="w-full p-3 rounded-lg border border-red-200 bg-red-50 focus:ring-2 focus:ring-red-500 outline-none"
                                value={formData.bad_example}
                                onChange={e => setFormData({...formData, bad_example: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-emerald-500 uppercase">Good Example</label>
                            <input 
                                className="w-full p-3 rounded-lg border border-emerald-200 bg-emerald-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.good_example}
                                onChange={e => setFormData({...formData, good_example: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-500 uppercase">Pro Tip</label>
                        <input 
                            className="w-full p-3 rounded-lg border border-amber-200 bg-amber-50 focus:ring-2 focus:ring-amber-500 outline-none"
                            placeholder="A quick tip to remember..."
                            value={formData.tip}
                            onChange={e => setFormData({...formData, tip: e.target.value})}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-1 shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2"
                    >
                        {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/> : <Save size={18}/>}
                        {saving ? "Saving..." : "Save Rule"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}