import React, { useState } from "react";
import { Teacher } from "../../types";

interface TeacherFormProps {
    initialData?: Partial<Teacher>;
    onSave: (data: { name: string; email: string; phone: string; subjects: string[] }) => Promise<void>;
    onCancel?: () => void;
}

export function TeacherForm({ initialData, onSave, onCancel }: TeacherFormProps) {
    const [form, setForm] = useState({
        name: initialData?.name ?? "",
        email: initialData?.email ?? "",
        phone: initialData?.phone ?? "",
        subjects: initialData?.subjects?.join(", ") ?? "",
    });
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await onSave({
                name: form.name,
                email: form.email,
                phone: form.phone,
                subjects: form.subjects.split(",").map(s => s.trim()).filter(s => s),
            });
        } catch (err) {
            alert("حدث خطأ أثناء حفظ بيانات المعلم");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow">
            <h3 className="font-bold text-lg">
                {initialData ? "تعديل المعلم" : "إضافة معلم جديد"}
            </h3>

            <input
                required
                name="name"
                placeholder="اسم المعلم"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />

            <input
                name="email"
                type="email"
                placeholder="البريد الإلكتروني"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />

            <input
                name="phone"
                placeholder="رقم الهاتف"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />

            <input
                name="subjects"
                placeholder="المواد (مفصولة بفواصل)"
                value={form.subjects}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
            />

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "جاري الحفظ..." : "حفظ"}
                </button>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        إلغاء
                    </button>
                )}
            </div>
        </form>
    );
}
