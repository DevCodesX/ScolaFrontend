import React, { useEffect, useState, useMemo } from "react";
import {
  Plus, Pencil, Trash2, X, Search, SlidersHorizontal,
  Users, ChevronLeft, ChevronRight, UserPlus,
} from "lucide-react";
import { getStudents, addStudent, updateStudent, deleteStudent, Student } from "../services/students";

/* ─── Styles ─── */

const S = {
  // Stats card
  statCard: {
    background: "#fff", padding: 24, borderRadius: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  } as React.CSSProperties,
  statLabel: { fontSize: 14, color: "#64748b", fontWeight: 500, marginBottom: 4 } as React.CSSProperties,
  statValue: { fontSize: 30, fontWeight: 700, color: "#1e293b" } as React.CSSProperties,
  statIcon: (bg: string, color: string) => ({
    width: 48, height: 48, borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center", background: bg, color,
  } as React.CSSProperties),

  // Table card
  card: {
    background: "#fff", borderRadius: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9",
    display: "flex", flexDirection: "column" as const, overflow: "hidden",
  } as React.CSSProperties,
  toolbar: {
    padding: 24, borderBottom: "1px solid #f1f5f9",
    display: "flex", flexWrap: "wrap" as const, alignItems: "center",
    justifyContent: "space-between", gap: 16,
  } as React.CSSProperties,
  searchWrap: { position: "relative" as const, width: 288 } as React.CSSProperties,
  searchIcon: {
    position: "absolute" as const, right: 12, top: "50%", transform: "translateY(-50%)",
    width: 20, height: 20, color: "#94a3b8", pointerEvents: "none" as const,
  } as React.CSSProperties,
  searchInput: {
    width: "100%", padding: "10px 40px 10px 16px", border: "1px solid #e2e8f0",
    borderRadius: 8, fontSize: 14, color: "#334155", background: "#fff",
    outline: "none",
  } as React.CSSProperties,
  filterBtn: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
    border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff",
    color: "#475569", fontSize: 14, fontWeight: 500, cursor: "pointer",
  } as React.CSSProperties,
  addBtn: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 24px",
    background: "#0d59f2", color: "#fff", border: "none", borderRadius: 8,
    fontSize: 14, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 12px rgba(13,89,242,0.3)", transition: "all 0.2s",
  } as React.CSSProperties,

  // Table
  table: { width: "100%", textAlign: "right" as const, borderCollapse: "collapse" as const } as React.CSSProperties,
  th: {
    padding: "16px 24px", fontSize: 12, fontWeight: 600, color: "#64748b",
    textTransform: "uppercase" as const, letterSpacing: "0.05em",
    background: "#f8fafc",
  } as React.CSSProperties,
  td: { padding: "16px 24px", fontSize: 14, color: "#475569", whiteSpace: "nowrap" as const } as React.CSSProperties,
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.15s", cursor: "default" } as React.CSSProperties,

  // Avatar
  avatar: (name: string) => {
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) { hash = (hash << 5) - hash + name.charCodeAt(i); hash |= 0; }
    const bg = colors[Math.abs(hash) % colors.length];
    return {
      width: 40, height: 40, borderRadius: "50%", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: `${bg}20`, color: bg, fontWeight: 700, fontSize: 16, flexShrink: 0,
    } as React.CSSProperties;
  },

  // Action buttons
  actionBtn: (hoverColor: string) => ({
    padding: 6, border: "none", background: "none", cursor: "pointer",
    borderRadius: 8, color: "#94a3b8", transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  } as React.CSSProperties),

  // Pagination
  pagination: {
    padding: "16px 24px", borderTop: "1px solid #f1f5f9",
    display: "flex", flexWrap: "wrap" as const, alignItems: "center",
    justifyContent: "space-between", gap: 16,
  } as React.CSSProperties,
  pageBtn: (active: boolean) => ({
    width: 32, height: 32, borderRadius: 8, display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 14,
    fontWeight: 500, cursor: "pointer", border: active ? "none" : "1px solid #e2e8f0",
    background: active ? "#0d59f2" : "transparent",
    color: active ? "#fff" : "#475569",
    boxShadow: active ? "0 2px 8px rgba(13,89,242,0.2)" : "none",
    transition: "all 0.15s",
  } as React.CSSProperties),

  // Modal
  overlay: {
    position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
  } as React.CSSProperties,
  modal: {
    background: "#fff", borderRadius: 16, padding: 24,
    width: "100%", maxWidth: 440, margin: "0 16px",
  } as React.CSSProperties,
  input: {
    width: "100%", padding: "12px 16px", border: "1px solid #e2e8f0",
    borderRadius: 12, fontSize: 14, color: "#334155", outline: "none",
    transition: "border-color 0.15s",
  } as React.CSSProperties,
};

const ITEMS_PER_PAGE = 10;

/* ─── Component ─── */

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { loadStudents(); }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setFormData({ name: "", email: "", phone: "" });
    setEditingStudent(null);
    setShowForm(true);
  }

  function openEditForm(student: Student) {
    setFormData({ name: student.name, email: student.email || "", phone: student.phone || "" });
    setEditingStudent(student);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingStudent) {
        const updated = await updateStudent(editingStudent.id, formData);
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? updated : s));
      } else {
        const newStudent = await addStudent(formData);
        setStudents(prev => [newStudent, ...prev]);
      }
      setShowForm(false);
    } catch (err) {
      alert("حدث خطأ أثناء حفظ البيانات");
      console.error(err);
    }
  }

  async function handleDelete(student: Student) {
    if (!window.confirm(`هل أنت متأكد من حذف الطالب "${student.name}"؟`)) return;
    try {
      await deleteStudent(student.id);
      setStudents(prev => prev.filter(s => s.id !== student.id));
    } catch (err) {
      alert("حدث خطأ أثناء حذف الطالب");
      console.error(err);
    }
  }

  // Search filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.id && s.id.toString().includes(q))
    );
  }, [students, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page on search
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // Format date
  function fmtDate(dateStr?: string): string {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("ar-EG", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch { return "-"; }
  }

  /* ─── Render ─── */

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <p style={{ color: "#6b7280", marginTop: 16 }}>جاري تحميل بيانات الطلاب...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
        <div style={S.statCard}>
          <div>
            <p style={S.statLabel}>إجمالي الطلاب</p>
            <h3 style={S.statValue}>{students.length.toLocaleString("ar-EG")}</h3>
          </div>
          <div style={S.statIcon("rgba(13,89,242,0.1)", "#0d59f2")}>
            <Users style={{ width: 24, height: 24 }} />
          </div>
        </div>
        <div style={S.statCard}>
          <div>
            <p style={S.statLabel}>طلاب هذا الشهر</p>
            <h3 style={S.statValue}>
              {students.filter(s => {
                if (!s.created_at) return false;
                const d = new Date(s.created_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length.toLocaleString("ar-EG")}
            </h3>
          </div>
          <div style={S.statIcon("rgba(249,115,22,0.1)", "#f97316")}>
            <UserPlus style={{ width: 24, height: 24 }} />
          </div>
        </div>
      </div>

      {/* ── Main Table Card ── */}
      <div style={S.card}>
        {/* Toolbar */}
        <div style={S.toolbar}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={S.searchWrap}>
              <Search style={S.searchIcon} />
              <input
                style={S.searchInput}
                placeholder="البحث بالاسم أو الرقم التعريفي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#0d59f2"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(13,89,242,0.1)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <button style={S.filterBtn}>
              <SlidersHorizontal style={{ width: 18, height: 18 }} />
              <span>تصفية</span>
            </button>
          </div>
          <button
            style={S.addBtn}
            onClick={openAddForm}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#0b4dd4"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0d59f2"; }}
          >
            <Plus style={{ width: 18, height: 18 }} />
            <span>إضافة طالب جديد</span>
          </button>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, background: "#dbeafe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Users style={{ width: 32, height: 32, color: "#2563eb" }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
              {searchQuery ? "لا توجد نتائج" : "لا يوجد طلاب حتى الآن"}
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>
              {searchQuery ? "حاول تغيير كلمة البحث" : "ابدأ بإضافة طالب جديد"}
            </p>
            {!searchQuery && (
              <button style={S.addBtn} onClick={openAddForm}>
                <Plus style={{ width: 18, height: 18 }} />
                إضافة طالب
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, borderTopRightRadius: 8 }}>الطالب</th>
                    <th style={S.th}>الرقم التعريفي</th>
                    <th style={S.th}>البريد الإلكتروني</th>
                    <th style={S.th}>الهاتف</th>
                    <th style={S.th}>تاريخ التسجيل</th>
                    <th style={{ ...S.th, textAlign: "center", borderTopLeftRadius: 8 }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((student) => (
                    <tr
                      key={student.id}
                      style={S.tr}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {/* Student name + avatar */}
                      <td style={{ ...S.td }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={S.avatar(student.name)}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{student.name}</div>
                          </div>
                        </div>
                      </td>
                      {/* ID */}
                      <td style={{ ...S.td, fontWeight: 500, color: "#475569" }}>
                        #{student.id.toString().slice(-6).padStart(6, "0")}
                      </td>
                      {/* Email */}
                      <td style={{ ...S.td, color: "#64748b", fontSize: 13 }}>
                        {student.email || "-"}
                      </td>
                      {/* Phone */}
                      <td style={{ ...S.td, color: "#64748b" }}>
                        {student.phone || "-"}
                      </td>
                      {/* Date */}
                      <td style={{ ...S.td, color: "#64748b" }}>
                        {fmtDate(student.created_at)}
                      </td>
                      {/* Actions */}
                      <td style={{ ...S.td, textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <button
                            style={S.actionBtn("#f97316")}
                            title="تعديل"
                            onClick={() => openEditForm(student)}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "#f97316"; el.style.background = "rgba(249,115,22,0.1)"; }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "#94a3b8"; el.style.background = "none"; }}
                          >
                            <Pencil style={{ width: 18, height: 18 }} />
                          </button>
                          <button
                            style={S.actionBtn("#ef4444")}
                            title="حذف"
                            onClick={() => handleDelete(student)}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "#ef4444"; el.style.background = "rgba(239,68,68,0.1)"; }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "#94a3b8"; el.style.background = "none"; }}
                          >
                            <Trash2 style={{ width: 18, height: 18 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={S.pagination}>
              <div style={{ fontSize: 14, color: "#64748b" }}>
                عرض <strong style={{ color: "#1e293b" }}>{(page - 1) * ITEMS_PER_PAGE + 1}</strong> إلى{" "}
                <strong style={{ color: "#1e293b" }}>{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</strong> من أصل{" "}
                <strong style={{ color: "#1e293b" }}>{filtered.length}</strong> سجل
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  style={{ ...S.pageBtn(false), opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? "default" : "pointer" }}
                  disabled={page <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      style={S.pageBtn(pageNum === page)}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <span style={{ color: "#94a3b8" }}>...</span>
                    <button style={S.pageBtn(false)} onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  style={{ ...S.pageBtn(false), opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? "default" : "pointer" }}
                  disabled={page >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronLeft style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                {editingStudent ? "تعديل الطالب" : "إضافة طالب جديد"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input
                required
                placeholder="اسم الطالب"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={S.input}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#0d59f2"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                style={S.input}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#0d59f2"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
              />
              <input
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                style={S.input}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#0d59f2"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; }}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button type="submit" style={{ ...S.addBtn, flex: 1, justifyContent: "center" }}>
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ padding: "10px 24px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
