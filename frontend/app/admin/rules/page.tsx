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

    if (error) toast.error("Lỗi khi tải" + error.message);
    else setRules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRules(); }, []);

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
        toast.error("Key và Title là bắt buộc!");
        return;
    }
    setSaving(true);
    toast.success("Lưu thành công!");

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
        toast.error("Lưu thất bại!"+ error.message);
    } else {
        fetchRules(); // Refresh list
        setIsModalOpen(false);
    }
    setSaving(false);
  };

  // 4. HANDLE DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    
    const { error } = await supabase
        .from("grammar_rules")
        .delete()
        .eq("id", id);
    
    if (error) toast.error("Xóa thất bại!" + error.message);
    else fetchRules();
  };

  // Filter Search
  const filteredRules = rules.filter(r => 
    r.error_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Grammar Rules</h1>
           <p className="text-slate-500">Manage educational content for users.</p>
        </div>
        <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
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
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
         />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                    <th className="p-4 font-bold text-slate-500 text-sm">Error Key (Backend)</th>
                    <th className="p-4 font-bold text-slate-500 text-sm">Title (Display)</th>
                    <th className="p-4 font-bold text-slate-500 text-sm">Example</th>
                    <th className="p-4 font-bold text-slate-500 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading data...</td></tr>
                ) : filteredRules.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">No rules found.</td></tr>
                ) : (
                    filteredRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-4 font-mono text-sm font-bold text-indigo-600">{rule.error_key}</td>
                            <td className="p-4 font-medium text-slate-800">{rule.title}</td>
                            <td className="p-4 text-sm text-slate-500 truncate max-w-xs">{rule.good_example}</td>
                            <td className="p-4 text-right flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(rule)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Edit">
                                    <Edit size={18}/>
                                </button>
                                <button onClick={() => handleDelete(rule.id!)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                    <Trash2 size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
         </table>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {formData.id ? <Edit className="text-indigo-500"/> : <Plus className="text-emerald-500"/>}
                        {formData.id ? "Edit Grammar Rule" : "Create New Rule"}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24}/>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Error Key (Unique)</label>
                            <input 
                                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                placeholder="e.g. Past Tense"
                                value={formData.error_key}
                                onChange={e => setFormData({...formData, error_key: e.target.value})}
                            />
                            <p className="text-[10px] text-slate-400">Must match exactly with Gemini output key.</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Title (Display)</label>
                            <input 
                                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. Thì Quá khứ đơn"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Definition</label>
                        <textarea 
                            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20"
                            placeholder="Explain what this error is..."
                            value={formData.definition}
                            onChange={e => setFormData({...formData, definition: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Rule (The Fix)</label>
                        <div className="flex gap-2">
                            <div className="bg-indigo-50 p-2 rounded text-indigo-500"><BookOpen size={20}/></div>
                            <input 
                                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900"
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
                        className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
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