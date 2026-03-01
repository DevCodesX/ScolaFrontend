import React, { useEffect, useState } from "react";
import { Plus, Mail, Upload } from "lucide-react";
import { UserTable } from "../components/users";
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from "../services/teachers";
import { TeacherForm } from "../components/teachers/TeacherForm";
import { InviteTeacherModal } from "../components/teachers/InviteTeacherModal";
import { BulkTeacherImportModal } from "../components/teachers/BulkTeacherImportModal";
import { Teacher } from "../types";

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Fetch teachers on mount
  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      setLoading(true);
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Failed to load teachers:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(teacher: Teacher) {
    setEditingTeacher(teacher);
  }

  async function handleDelete(teacher: Teacher) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف المعلم "${teacher.name}"؟`
    );

    if (!confirmed) return;

    try {
      await deleteTeacher(teacher.id);
      setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
    } catch (err) {
      alert("حدث خطأ أثناء حذف المعلم");
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المعلمين</h1>
          <p className="text-gray-500 mt-1">
            عرض وإدارة بيانات المعلمين في المؤسسة
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 border-2 border-indigo-600 text-indigo-600 px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-50 transition-all"
          >
            <Upload className="w-5 h-5" />
            استيراد جماعي
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-4 py-2.5 rounded-xl font-medium hover:bg-blue-50 transition-all"
          >
            <Mail className="w-5 h-5" />
            دعوة مدرس
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            إضافة مباشر
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>جاري تحميل المعلمين...</p>
      ) : (
        <UserTable
          users={teachers.map(t => ({
            ...t,
            role: 'teacher' as const,
            subjects: t.subjects || [],
            classroomIds: [],
            createdAt: new Date()
          }))}
          type="teacher"
          title="قائمة المعلمين"
          onEdit={(user) => handleEdit(teachers.find(t => t.id === user.id)!)}
          onDelete={(user) => handleDelete(teachers.find(t => t.id === user.id)!)}
        />
      )}

      {/* Add Teacher Form */}
      {showForm && (
        <TeacherForm
          onSave={async (data) => {
            const newTeacher = await addTeacher(data);
            setTeachers((prev) => [newTeacher, ...prev]);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Teacher Form */}
      {editingTeacher && (
        <TeacherForm
          initialData={editingTeacher}
          onSave={async (data) => {
            const updated = await updateTeacher(editingTeacher.id, data);
            setTeachers(prev => prev.map(t =>
              t.id === editingTeacher.id ? updated : t
            ));
            setEditingTeacher(null);
          }}
          onCancel={() => setEditingTeacher(null)}
        />
      )}

      {/* Invite Teacher Modal */}
      {showInviteModal && (
        <InviteTeacherModal
          onClose={() => setShowInviteModal(false)}
          onSuccess={loadTeachers}
        />
      )}

      {/* Bulk Teacher Import Modal */}
      {showBulkImport && (
        <BulkTeacherImportModal
          onClose={() => setShowBulkImport(false)}
          onSuccess={loadTeachers}
        />
      )}
    </div>
  );
}
