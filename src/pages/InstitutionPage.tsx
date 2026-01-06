import React from "react";
import { InstitutionForm } from '../components/institution';

export function InstitutionPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إدارة المؤسسة</h1>
        <p className="text-gray-500 mt-1">تعديل وإدارة بيانات المؤسسة التعليمية</p>
      </div>

      {/* Institution Form */}
      <div className="max-w-2xl">
        <InstitutionForm />
      </div>
    </div>
  );
}
