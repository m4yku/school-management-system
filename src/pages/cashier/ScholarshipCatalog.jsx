import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Award, Trash2, X, Tag, FileText, Percent, Banknote, Landmark, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const ScholarshipCatalog = () => {
    const { branding, API_BASE_URL } = useAuth();
    const [scholarships, setScholarships] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        discount_type: 'Percentage',
        discount_value: 0,
        description: ''
    });

    const handleEditClick = (scholarship) => {
        setFormData({
            code: scholarship.code,
            name: scholarship.name,
            discount_type: scholarship.discount_type,
            discount_value: scholarship.discount_value,
            description: scholarship.description || ''
        });
        setCurrentId(scholarship.id);
        setIsEdit(true);
        setShowAddModal(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Sigurado ka bang gusto mong i-delete ang "${name}"?`)) {
            try {
                const res = await axios.post(`${API_BASE_URL}/cashier/manage_scholarships.php`, {
                    id: id,
                    action: 'delete'
                });
                if (res.data.status === 'success') fetchCatalog();
            } catch (err) { alert("Error deleting grant"); }
        }
    };

    useEffect(() => { fetchCatalog(); }, []);

    const fetchCatalog = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/cashier/manage_scholarships.php`);
            setScholarships(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Fetch error"); }
    };

    const handleSave = async () => {
        if (!formData.code || !formData.name) return alert("Fill up required fields!");
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/cashier/manage_scholarships.php`, {
                ...formData,
                id: currentId,
                action: isEdit ? 'edit' : 'add' // Dito magdedecide
            });

            if (res.data.status === 'success') {
                setShowAddModal(false);
                setIsEdit(false);
                fetchCatalog();
                setFormData({ code: '', name: '', discount_type: 'Percentage', discount_value: 0, description: '' });
            }
        } catch (err) { alert("Error saving data"); }
        finally { setLoading(false); }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 text-left">
            {/* HEADER: Clean & Minimalist */}
            <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Landmark className="text-blue-600" size={36} /> Scholarship Catalog
                    </h1>
                    <p className="text-slate-400 font-medium text-sm mt-1">Manage educational grants available for students.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2 active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} /> Create New Grant
                </button>
            </div>

            {/* GRID: Structured & Balanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {scholarships.length > 0 ? scholarships.map((s) => (
                    <div key={s.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-300">

                        {/* --- ETO YUNG IDADAGDAG NA BUTTONS (Edit at Delete) --- */}
                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            {/* Edit Button */}
                            <button
                                onClick={() => handleEditClick(s)}
                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                                title="Edit Grant"
                            >
                                <Pencil size={18} />
                            </button>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDelete(s.id, s.name)}
                                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                                title="Delete Grant"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        {/* --- KATAPUSAN NG BUTTONS --- */}

                        {/* Design ng card sa loob */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-blue-500 transition-colors"></div>

                        <div className="flex justify-between items-start mb-5 pl-2">
                            <div className="space-y-1">
                                <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.code}</span>
                                <h3 className="text-2xl font-black text-slate-900 uppercase leading-none pr-10">{s.name}</h3>
                            </div>
                            <Award className="text-slate-100" size={32} />
                        </div>

                        <p className="text-sm text-slate-500 mb-8 pl-2 line-clamp-2 h-10 italic">
                            {s.description || 'No description available.'}
                        </p>

                        <div className="border-t border-slate-50 pt-6 pl-2 flex items-end justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount Benefit</p>
                                <p className="text-4xl font-black text-blue-600 tracking-tight">
                                    {s.discount_type === 'Percentage' ? `${parseFloat(s.discount_value)}%` : `₱${parseFloat(s.discount_value).toLocaleString()}`}
                                </p>
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.discount_type}</span>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center text-slate-300 font-bold uppercase tracking-widest">
                        Catalog is empty
                    </div>
                )}
            </div>

            {/* MODAL: Highly Organized & Clear */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in">
                    {/* Idinagdag ang max-h at overflow-y-auto dito */}
                    <div className="bg-white w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 custom-scrollbar">

                        {/* Close Button - Ginawang 'sticky' para laging kita */}
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 z-10"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1 text-left">Create New Grant</h2>
                        <p className="text-slate-400 text-left mb-8 text-sm">Fill in the details to define a new scholarship type.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 text-left">
                            {/* Left Column */}
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Tag size={12} /> Scholarship Code</label>
                                    <input
                                        className="w-full p-4 bg-slate-50 rounded-xl font-bold border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
                                        placeholder="e.g. ACAD-100, ESC"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Scholarship Name</label>
                                    <input
                                        className="w-full p-4 bg-slate-50 rounded-xl font-bold border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
                                        placeholder="e.g. 100% Academic Scholar"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Right Column (Description) */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><FileText size={12} /> Description (Optional)</label>
                                <textarea
                                    className="w-full h-[125px] p-4 bg-slate-50 rounded-xl font-bold border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none resize-none transition-all text-sm"
                                    placeholder="Brief details..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            {/* Value Type Selection (Full Width) */}
                            <div className="col-span-1 md:col-span-2 space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block text-left">Discount Value Type</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.discount_type === 'Percentage' ? 'bg-white border-blue-500 shadow-sm' : 'bg-white/50 border-transparent hover:border-blue-200'}`}>
                                        <input type="radio" name="discount_type" className="w-4 h-4 accent-blue-600" checked={formData.discount_type === 'Percentage'} onChange={() => setFormData({ ...formData, discount_type: 'Percentage', discount_value: 0 })} />
                                        <div>
                                            <span className="font-bold text-slate-800 text-sm block">Percentage (%)</span>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.discount_type === 'Fixed Amount' ? 'bg-white border-blue-500 shadow-sm' : 'bg-white/50 border-transparent hover:border-blue-200'}`}>
                                        <input type="radio" name="discount_type" className="w-4 h-4 accent-blue-600" checked={formData.discount_type === 'Fixed Amount'} onChange={() => setFormData({ ...formData, discount_type: 'Fixed Amount', discount_value: 0 })} />
                                        <div>
                                            <span className="font-bold text-slate-800 text-sm block">Fixed Amount (₱)</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Dynamic Value Input (Full Width) */}
                            <div className="col-span-1 md:col-span-2 space-y-2 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 block text-left">
                                    {formData.discount_type === 'Percentage' ? 'Set Percentage Value' : 'Set Cash Amount'}
                                </label>

                                {formData.discount_type === 'Percentage' ? (
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl font-black text-blue-600 w-20 text-right">{formData.discount_value}%</span>
                                        <input
                                            type="range" min="0" max="100" step="5"
                                            className="flex-1 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            value={formData.discount_value}
                                            onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="number"
                                            className="w-full p-4 pl-12 bg-white rounded-xl font-black text-xl border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                                            placeholder="0.00"
                                            value={formData.discount_value}
                                            onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-8">
                            <button onClick={() => setShowAddModal(false)} className="order-2 sm:order-1 flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors text-xs">Cancel</button>
                            <button onClick={handleSave} disabled={loading} className="order-1 sm:order-2 flex-[2] bg-blue-600 text-white py-4 px-8 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300 text-xs">
                                {loading ? 'Saving...' : 'Confirm and Save Grant'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScholarshipCatalog;