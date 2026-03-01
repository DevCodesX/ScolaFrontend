import React, { useEffect, useState } from "react";
import { getToken } from "../services/authService";
import { InstitutionForm } from "../components/institution";

export function InstitutionPage() {
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstitution = async () => {
    try {
      const res = await fetch("/api/institutions/me", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch institution");
      }

      const data = await res.json();
      setInstitution(data);
    } catch (err: any) {
      console.error("Error fetching institution:", err);
      setError(err.message);
      setInstitution(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitution();
  }, []);

  const handleSave = async (updatedData: any) => {
    try {
      const res = await fetch("/api/institutions/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update");
      }

      alert("تم حفظ التعديلات بنجاح ✅");
      setInstitution((prev: any) => ({ ...prev, ...updatedData }));
    } catch (err: any) {
      console.error("Error saving institution:", err);
      alert("حدث خطأ أثناء الحفظ: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500">جاري تحميل بيانات المؤسسة...</p>
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-gray-700 font-medium">لا توجد بيانات مؤسسة</p>
          <p className="text-gray-400 text-sm mt-1">{error || "تأكد من تسجيل الدخول كمدير مؤسسة"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المؤسسة</h1>
        <p className="text-gray-500 mt-1">
          تعديل وإدارة بيانات المؤسسة التعليمية
        </p>
      </div>

      {/* Institution Info Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-3xl">🏫</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">{institution.name}</h2>
            <p className="text-blue-100 text-sm mt-1">{institution.admin_email}</p>
            <p className="text-blue-200 text-xs mt-1">
              تاريخ الإنشاء: {new Date(institution.created_at).toLocaleDateString("ar-EG")}
            </p>
          </div>
        </div>
      </div>

      {/* Institution Form */}
      <div className="max-w-2xl">
        <InstitutionForm
          institution={institution}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
