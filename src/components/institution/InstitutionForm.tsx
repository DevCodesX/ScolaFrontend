import React, { useState } from 'react';
import { Building2, MapPin, Globe } from 'lucide-react';

// Institution type definition
type Institution = {
  id: string;
  name: string;
  country?: string;
  city?: string;
  address?: string;
};

// Component props definition
type InstitutionFormProps = {
  institution: Institution;
  onSave: (data: Partial<Institution>) => Promise<void>;
};

export function InstitutionForm({ institution, onSave }: InstitutionFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: institution?.name ?? "",
    country: institution?.country ?? "",
    city: institution?.city ?? "",
    address: institution?.address ?? "",
  });

  // Loading check - show message if data is not ready
  if (!institution) {
    return <p>Loading institution data...</p>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
    setIsEditing(false);
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

      <div className="p-6 space-y-6">
        {/* Institution Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم المؤسسة
          </label>
          <div className="relative">
            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الدولة
          </label>
          <div className="relative">
            <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المدينة
          </label>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
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
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl resize-none ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
              rows={3}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 mt-4">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Edit
            </button>
          )}

          {isEditing && (
            <>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save modifications
              </button>

              <button
                onClick={() => {
                  setFormData({
                    name: institution.name ?? "",
                    country: institution.country ?? "",
                    city: institution.city ?? "",
                    address: institution.address ?? "",
                  });
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                cancellation
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
