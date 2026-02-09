import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Users, UserPlus } from "lucide-react";
import { getClasses, addClass, updateClass, deleteClass, getClassStudents, addStudentToClass, removeStudentFromClass, Class } from "../services/classes";
import { getTeachers, Teacher } from "../services/teachers";
import { getStudents, Student } from "../services/students";

export function ClassroomsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: "", teacher_id: "" });

  // Student assignment modal
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [classesData, teachersData, studentsData] = await Promise.all([
        getClasses(),
        getTeachers(),
        getStudents()
      ]);
      setClasses(classesData);
      setTeachers(teachersData);
      setStudents(studentsData);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setFormData({ name: "", teacher_id: "" });
    setEditingClass(null);
    setShowForm(true);
  }

  function openEditForm(cls: Class) {
    setFormData({ name: cls.name, teacher_id: cls.teacher_id || "" });
    setEditingClass(cls);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingClass) {
        const updated = await updateClass(editingClass.id, formData);
        setClasses(prev => prev.map(c => c.id === editingClass.id ? updated : c));
      } else {
        const newClass = await addClass(formData);
        setClasses(prev => [newClass, ...prev]);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      alert("حدث خطأ أثناء حفظ البيانات");
      console.error(err);
    }
  }

  async function handleDelete(cls: Class) {
    if (!window.confirm(`هل أنت متأكد من حذف الصف "${cls.name}"؟`)) return;
    try {
      await deleteClass(cls.id);
      setClasses(prev => prev.filter(c => c.id !== cls.id));
    } catch (err) {
      alert("حدث خطأ أثناء حذف الصف");
      console.error(err);
    }
  }

  // Student assignment functions
  async function openStudentModal(cls: Class) {
    setSelectedClass(cls);
    try {
      const students = await getClassStudents(cls.id);
      setClassStudents(students);
      setShowStudentModal(true);
    } catch (err) {
      console.error("Failed to load class students:", err);
    }
  }

  async function handleAddStudent() {
    if (!selectedClass || !selectedStudentId) return;
    try {
      await addStudentToClass(selectedClass.id, selectedStudentId);
      const updatedStudents = await getClassStudents(selectedClass.id);
      setClassStudents(updatedStudents);
      setSelectedStudentId("");
    } catch (err) {
      alert("حدث خطأ أثناء إضافة الطالب");
      console.error(err);
    }
  }

  async function handleRemoveStudent(studentId: string) {
    if (!selectedClass) return;
    try {
      await removeStudentFromClass(selectedClass.id, studentId);
      setClassStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (err) {
      alert("حدث خطأ أثناء إزالة الطالب");
      console.error(err);
    }
  }

  // Get students not in the current class
  const availableStudents = students.filter(
    s => !classStudents.find(cs => cs.id === s.id)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الصفوف</h1>
          <p className="text-gray-500 mt-1">عرض وإدارة الصفوف الدراسية في المؤسسة</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          إضافة صف
        </button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <p className="text-gray-500">جاري تحميل الصفوف...</p>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">لا يوجد صفوف حتى الآن</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <div key={cls.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {cls.teacher_name ? `المعلم: ${cls.teacher_name}` : "لم يتم تعيين معلم"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openStudentModal(cls)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="إدارة الطلاب"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditForm(cls)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cls)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => openStudentModal(cls)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">إدارة الطلاب</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Class Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingClass ? "تعديل الصف" : "إضافة صف جديد"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="اسم الصف"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={formData.teacher_id}
                onChange={e => setFormData(prev => ({ ...prev, teacher_id: e.target.value }))}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">اختر المعلم (اختياري)</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Assignment Modal */}
      {showStudentModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                طلاب صف: {selectedClass.name}
              </h3>
              <button onClick={() => setShowStudentModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Student */}
            <div className="flex gap-2 mb-4">
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-xl bg-white"
              >
                <option value="">اختر طالب لإضافته...</option>
                {availableStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddStudent}
                disabled={!selectedStudentId}
                className="px-4 py-2 bg-green-600 text-white rounded-xl disabled:opacity-50"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto">
              {classStudents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا يوجد طلاب في هذا الصف</p>
              ) : (
                <div className="space-y-2">
                  {classStudents.map(student => (
                    <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email || student.phone || ""}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowStudentModal(false)}
              className="mt-4 w-full py-3 bg-gray-200 text-gray-700 rounded-xl"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
