import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Users, GraduationCap, BookOpen, FileSpreadsheet, FileText,
    Plus, Pencil, Trash2, Download, X, Search
} from "lucide-react";
import { getInstitutionDashboard, exportReport, DashboardStats } from "../services/iamService";
import { getAuthHeaders } from "../services/authService";
import { apiUrl } from "../lib/api";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";

interface TeacherForm {
    name: string;
    email: string;
    phone: string;
    subject: string;
}

const emptyTeacher: TeacherForm = { name: "", email: "", phone: "", subject: "" };

export function InstitutionDashboardPage() {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";

    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exporting, setExporting] = useState(false);

    // Teacher CRUD
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [teacherForm, setTeacherForm] = useState<TeacherForm>(emptyTeacher);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const TEACHERS_API = apiUrl("/api/teachers");

    async function loadData() {
        try {
            const data = await getInstitutionDashboard();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleExport(format: "excel" | "pdf") {
        setExporting(true);
        try {
            await exportReport(format);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setExporting(false);
        }
    }

    function openAddModal() {
        setEditingId(null);
        setTeacherForm(emptyTeacher);
        setShowModal(true);
    }

    function openEditModal(teacher: DashboardStats["teachers"][0]) {
        setEditingId(teacher.id);
        setTeacherForm({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone || "",
            subject: teacher.subject || "",
        });
        setShowModal(true);
    }

    async function handleSaveTeacher(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingId ? `${TEACHERS_API}/${editingId}` : TEACHERS_API;
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(teacherForm),
            });

            if (!res.ok) throw new Error("Failed to save teacher");
            setShowModal(false);
            await loadData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteTeacher(id: string) {
        if (!confirm(t("institutionDashboard.confirmDelete"))) return;
        try {
            const res = await fetch(`${TEACHERS_API}/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders() as HeadersInit,
            });
            if (!res.ok) throw new Error("Failed to delete");
            await loadData();
        } catch (err: any) {
            alert(err.message);
        }
    }

    const filteredTeachers = stats?.teachers.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.subject || "").toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, border: "3px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                    <p style={{ color: "#6b7280", marginTop: 16 }}>{t("common.loading")}</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#ef4444" }}>{error}</p>
                    <button onClick={() => { setLoading(true); setError(""); loadData(); }}
                        style={{ marginTop: 16, color: "#6366f1", cursor: "pointer", background: "none", border: "none", fontSize: 14 }}>
                        {t("common.back")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div dir={isRtl ? "rtl" : "ltr"} style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>{t("institutionDashboard.title")}</h1>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <LanguageSwitcher className="text-gray-700" />
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
                {/* Teachers Card */}
                <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: 16, padding: "24px", color: "white",
                    boxShadow: "0 8px 24px rgba(102,126,234,0.3)",
                    position: "relative", overflow: "hidden",
                }}>
                    <div style={{ position: "absolute", top: -10, right: -10, width: 80, height: 80, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                    <Users style={{ width: 28, height: 28, marginBottom: 12, opacity: 0.9 }} />
                    <p style={{ fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1 }}>{stats?.teacherCount || 0}</p>
                    <p style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{t("institutionDashboard.totalTeachers")}</p>
                </div>

                {/* Students Card */}
                <div style={{
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    borderRadius: 16, padding: "24px", color: "white",
                    boxShadow: "0 8px 24px rgba(245,87,108,0.3)",
                    position: "relative", overflow: "hidden",
                }}>
                    <div style={{ position: "absolute", top: -10, right: -10, width: 80, height: 80, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                    <GraduationCap style={{ width: 28, height: 28, marginBottom: 12, opacity: 0.9 }} />
                    <p style={{ fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1 }}>{stats?.studentCount || 0}</p>
                    <p style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{t("institutionDashboard.totalStudents")}</p>
                </div>

                {/* Classes Card */}
                <div style={{
                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    borderRadius: 16, padding: "24px", color: "white",
                    boxShadow: "0 8px 24px rgba(79,172,254,0.3)",
                    position: "relative", overflow: "hidden",
                }}>
                    <div style={{ position: "absolute", top: -10, right: -10, width: 80, height: 80, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                    <BookOpen style={{ width: 28, height: 28, marginBottom: 12, opacity: 0.9 }} />
                    <p style={{ fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1 }}>{stats?.classCount || 0}</p>
                    <p style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{t("institutionDashboard.totalClasses")}</p>
                </div>
            </div>

            {/* Export Buttons */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                <button
                    onClick={() => handleExport("excel")}
                    disabled={exporting}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "#10b981", color: "white", border: "none",
                        padding: "10px 20px", borderRadius: 12, fontSize: 14,
                        fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                        transition: "all 0.2s", opacity: exporting ? 0.6 : 1,
                    }}
                >
                    <FileSpreadsheet style={{ width: 16, height: 16 }} />
                    {t("common.exportExcel")}
                </button>
                <button
                    onClick={() => handleExport("pdf")}
                    disabled={exporting}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        background: "#ef4444", color: "white", border: "none",
                        padding: "10px 20px", borderRadius: 12, fontSize: 14,
                        fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
                        transition: "all 0.2s", opacity: exporting ? 0.6 : 1,
                    }}
                >
                    <FileText style={{ width: 16, height: 16 }} />
                    {t("common.exportPdf")}
                </button>
            </div>

            {/* Teachers Section */}
            <div style={{
                background: "white", borderRadius: 16, padding: 24,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6",
                marginBottom: 24,
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
                        {t("institutionDashboard.teachers")}
                    </h2>
                    <button
                        onClick={openAddModal}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white", border: "none", padding: "8px 16px",
                            borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                        }}
                    >
                        <Plus style={{ width: 16, height: 16 }} />
                        {t("institutionDashboard.addTeacher")}
                    </button>
                </div>

                {/* Search */}
                <div style={{ position: "relative", marginBottom: 16 }}>
                    <Search style={{
                        position: "absolute", top: "50%", transform: "translateY(-50%)",
                        width: 16, height: 16, color: "#9ca3af",
                        ...(isRtl ? { right: 14 } : { left: 14 }),
                    }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t("common.search")}
                        style={{
                            width: "100%", padding: "10px 14px",
                            ...(isRtl ? { paddingRight: 40 } : { paddingLeft: 40 }),
                            border: "1px solid #e5e7eb", borderRadius: 10,
                            fontSize: 14, background: "#f9fafb",
                            outline: "none",
                        }}
                    />
                </div>

                {/* Teachers Table */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                                <th style={{ padding: "12px 16px", textAlign: isRtl ? "right" : "left", fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                                    {t("institutionDashboard.teacherName")}
                                </th>
                                <th style={{ padding: "12px 16px", textAlign: isRtl ? "right" : "left", fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                                    {t("institutionDashboard.teacherEmail")}
                                </th>
                                <th style={{ padding: "12px 16px", textAlign: isRtl ? "right" : "left", fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                                    {t("institutionDashboard.teacherPhone")}
                                </th>
                                <th style={{ padding: "12px 16px", textAlign: isRtl ? "right" : "left", fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                                    {t("institutionDashboard.teacherSubject")}
                                </th>
                                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                                    {t("common.actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>
                                        {t("common.noData")}
                                    </td>
                                </tr>
                            ) : (
                                filteredTeachers.map((teacher, i) => (
                                    <tr key={teacher.id} style={{
                                        borderBottom: "1px solid #f3f4f6",
                                        background: i % 2 === 0 ? "white" : "#fafbfc",
                                        transition: "background 0.15s",
                                    }}>
                                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 500, color: "#111827" }}>
                                            {teacher.name}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#4b5563" }} dir="ltr">
                                            {teacher.email}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#4b5563" }} dir="ltr">
                                            {teacher.phone || "—"}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#4b5563" }}>
                                            {teacher.subject || "—"}
                                        </td>
                                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                            <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                                                <button
                                                    onClick={() => openEditModal(teacher)}
                                                    style={{
                                                        width: 32, height: 32, border: "none",
                                                        background: "#eef2ff", color: "#4f46e5",
                                                        borderRadius: 8, cursor: "pointer",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                    }}
                                                    title={t("common.edit")}
                                                >
                                                    <Pencil style={{ width: 14, height: 14 }} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTeacher(teacher.id)}
                                                    style={{
                                                        width: 32, height: 32, border: "none",
                                                        background: "#fef2f2", color: "#ef4444",
                                                        borderRadius: 8, cursor: "pointer",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                    }}
                                                    title={t("common.delete")}
                                                >
                                                    <Trash2 style={{ width: 14, height: 14 }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Students */}
            <div style={{
                background: "white", borderRadius: 16, padding: 24,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6",
            }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>
                    {t("institutionDashboard.recentStudents")}
                </h2>
                {(!stats?.recentStudents || stats.recentStudents.length === 0) ? (
                    <p style={{ color: "#9ca3af", textAlign: "center", padding: 24 }}>{t("common.noData")}</p>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                        {stats.recentStudents.map((student) => (
                            <div key={student.id} style={{
                                padding: "14px 16px", background: "#f9fafb",
                                borderRadius: 12, border: "1px solid #f3f4f6",
                            }}>
                                <p style={{ fontWeight: 600, color: "#111827", margin: 0, fontSize: 14 }}>{student.name}</p>
                                <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: 13 }} dir="ltr">{student.email}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Teacher Add/Edit Modal */}
            {showModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 50, backdropFilter: "blur(4px)",
                }} onClick={() => setShowModal(false)}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: "white", borderRadius: 20, padding: 32,
                            width: "90%", maxWidth: 480,
                            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                            animation: "fadeIn 0.2s ease",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
                                {editingId ? t("institutionDashboard.editTeacher") : t("institutionDashboard.addTeacher")}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}
                            >
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTeacher} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                                    {t("institutionDashboard.teacherName")}
                                </label>
                                <input
                                    type="text" value={teacherForm.name}
                                    onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })}
                                    required
                                    style={{
                                        width: "100%", padding: "10px 14px", border: "1px solid #d1d5db",
                                        borderRadius: 10, fontSize: 14, outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                                    {t("institutionDashboard.teacherEmail")}
                                </label>
                                <input
                                    type="email" value={teacherForm.email}
                                    onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })}
                                    required dir="ltr"
                                    style={{
                                        width: "100%", padding: "10px 14px", border: "1px solid #d1d5db",
                                        borderRadius: 10, fontSize: 14, outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                                    {t("institutionDashboard.teacherPhone")}
                                </label>
                                <input
                                    type="tel" value={teacherForm.phone}
                                    onChange={e => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                                    dir="ltr"
                                    style={{
                                        width: "100%", padding: "10px 14px", border: "1px solid #d1d5db",
                                        borderRadius: 10, fontSize: 14, outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                                    {t("institutionDashboard.teacherSubject")}
                                </label>
                                <input
                                    type="text" value={teacherForm.subject}
                                    onChange={e => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                                    style={{
                                        width: "100%", padding: "10px 14px", border: "1px solid #d1d5db",
                                        borderRadius: 10, fontSize: 14, outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                                <button
                                    type="submit" disabled={saving}
                                    style={{
                                        flex: 1, padding: "10px 0",
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        color: "white", border: "none", borderRadius: 10,
                                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                                        opacity: saving ? 0.6 : 1,
                                    }}
                                >
                                    {saving ? t("common.loading") : t("common.save")}
                                </button>
                                <button
                                    type="button" onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1, padding: "10px 0",
                                        background: "#f3f4f6", color: "#374151",
                                        border: "none", borderRadius: 10,
                                        fontSize: 14, fontWeight: 600, cursor: "pointer",
                                    }}
                                >
                                    {t("common.cancel")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
}
