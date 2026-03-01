import React, { useEffect, useState } from "react";
import { Plus, Trash2, Building2 } from "lucide-react";
import { fetchInstitutions, createInstitution, deleteInstitution, Institution } from "../services/institutionsApi";

export function InstitutionsPage() {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        loadInstitutions();
    }, []);

    async function loadInstitutions() {
        try {
            const data = await fetchInstitutions();
            setInstitutions(data);
        } catch (err) {
            console.error("Failed to load institutions:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd() {
        if (!name.trim()) return;

        setAdding(true);
        try {
            const newInst = await createInstitution(name.trim());
            setInstitutions(prev => [newInst, ...prev]);
            setName("");
        } catch (err) {
            alert("حدث خطأ أثناء إضافة المؤسسة");
            console.error(err);
        } finally {
            setAdding(false);
        }
    }

    async function handleDelete(inst: Institution) {
        if (!confirm(`هل أنت متأكد من حذف "${inst.name}"؟`)) return;

        try {
            await deleteInstitution(inst.id);
            setInstitutions(prev => prev.filter(i => i.id !== inst.id));
        } catch (err) {
            alert("حدث خطأ أثناء حذف المؤسسة");
            console.error(err);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة المؤسسات</h1>
                    <p className="text-gray-500 mt-1">عرض وإدارة المؤسسات التعليمية</p>
                </div>
            </div>

            {/* Add Form */}
            <div className="bg-white rounded-xl shadow p-4">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="اسم المؤسسة الجديدة"
                        className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={adding || !name.trim()}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                        {adding ? "جاري الإضافة..." : "إضافة"}
                    </button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <p className="text-gray-500">جاري تحميل المؤسسات...</p>
            ) : institutions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow">
                    <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">لا توجد مؤسسات حتى الآن</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {institutions.map((inst) => (
                            <li key={inst.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-blue-500" />
                                    <span className="font-medium text-gray-900">{inst.name}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(inst)}
                                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                    title="حذف"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
