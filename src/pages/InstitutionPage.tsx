import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { InstitutionForm } from "../components/institution";

export function InstitutionPage() {
  const [institution, setInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitution = async () => {
      const { data, error } = await supabase
        .from("institutions")
        .select("*");

      console.log("Supabase raw data:", data);
      console.log("Supabase error:", error);

      if (data && data.length > 0) {
        setInstitution(data[0]);
      } else {
        setInstitution(null);
      }

      setLoading(false);
    };

    fetchInstitution();
  }, []);

  if (loading) {
    return <p>جاري تحميل بيانات المؤسسة...</p>;
  }

  if (!institution) {
    return <p>لا توجد بيانات مؤسسة</p>;
  }

  const handleSave = async (updatedData: any) => {
    const { error } = await supabase
      .from("institutions")
      .update(updatedData)
      .eq("id", institution.id);

    if (error) {
      console.error(error);
      alert("An error occurred while saving");
    } else {
      alert("Edits saved successfully");
      setInstitution((prev: any) => ({ ...prev, ...updatedData }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المؤسسة</h1>
        <p className="text-gray-500 mt-1">
          تعديل وإدارة بيانات المؤسسة التعليمية
        </p>
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
