import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Save } from 'lucide-react';
import { mockInstitution } from '../../data/mockData';
import type { Institution } from '../../types';

export function InstitutionForm() {
  const [institution, setInstitution] = useState<Omit<Institution, 'id' | 'createdAt' | 'adminId'>>({
    name: mockInstitution.name,
    email: mockInstitution.email,
    phone: mockInstitution.phone,
    address: mockInstitution.address,
    logo: mockInstitution.logo,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('تم حفظ بيانات المؤسسة بنجاح');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">معلومات المؤسسة</h2>
            <p className="text-sm text-gray-500">إدارة بيانات المؤسسة الأساسية</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Institution Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم المؤسسة
          </label>
          <div className="relative">
            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={institution.name}
              onChange={(e) => setInstitution({ ...institution, name: e.target.value })}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="أدخل اسم المؤسسة"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={institution.email}
              onChange={(e) => setInstitution({ ...institution, email: e.target.value })}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="example@school.com"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف
          </label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={institution.phone}
              onChange={(e) => setInstitution({ ...institution, phone: e.target.value })}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="+966 XX XXX XXXX"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            العنوان
          </label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={institution.address}
              onChange={(e) => setInstitution({ ...institution, address: e.target.value })}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              placeholder="أدخل العنوان الكامل"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  );
}
