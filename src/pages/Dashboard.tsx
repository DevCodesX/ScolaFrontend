import React, { useEffect, useState, useMemo } from "react";
import {
  Filter,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  CalendarDays,
} from "lucide-react";
import { getAllSlots, TimetableSlot } from "../services/timetable";
import { getTeachers, Teacher } from "../services/teachers";
import { getClasses, Class } from "../services/classes";

/* ─── Constants ───────────────────────────────────────────── */

const DAYS: { key: string; label: string }[] = [
  { key: "sun", label: "الأحد" },
  { key: "mon", label: "الإثنين" },
  { key: "tue", label: "الثلاثاء" },
  { key: "wed", label: "الأربعاء" },
  { key: "thu", label: "الخميس" },
  { key: "fri", label: "الجمعة" },
  { key: "sat", label: "السبت" },
];

const WEEKEND_DAYS = ["fri", "sat"];

const HOURS = [
  "08:00 ص",
  "09:00 ص",
  "10:00 ص",
  "11:00 ص",
  "12:00 م",
  "01:00 م",
  "02:00 م",
  "03:00 م",
  "04:00 م",
];

const START_HOUR = 8;
const HOUR_PX = 96; // 96px per hour row

const COLORS = [
  { bg: "#eff6ff", border: "#3b82f6", title: "#1e3a5f", sub: "#1d4ed8", icon: "#2563eb" },
  { bg: "#ecfdf5", border: "#10b981", title: "#064e3b", sub: "#047857", icon: "#059669" },
  { bg: "#faf5ff", border: "#a855f7", title: "#3b0764", sub: "#7e22ce", icon: "#9333ea" },
  { bg: "#fffbeb", border: "#f59e0b", title: "#451a03", sub: "#b45309", icon: "#d97706" },
  { bg: "#fff1f2", border: "#f43f5e", title: "#4c0519", sub: "#be123c", icon: "#e11d48" },
  { bg: "#f0fdfa", border: "#14b8a6", title: "#042f2e", sub: "#0f766e", icon: "#0d9488" },
  { bg: "#ecfeff", border: "#06b6d4", title: "#083344", sub: "#0e7490", icon: "#0891b2" },
  { bg: "#eef2ff", border: "#6366f1", title: "#1e1b4b", sub: "#4338ca", icon: "#4f46e5" },
  { bg: "#fdf2f8", border: "#ec4899", title: "#500724", sub: "#be185d", icon: "#db2777" },
  { bg: "#f7fee7", border: "#84cc16", title: "#1a2e05", sub: "#4d7c0f", icon: "#65a30d" },
];

/* ─── Helpers ─────────────────────────────────────────────── */

function timeToOffset(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - START_HOUR) + m / 60;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getCurrentWeekDates(): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateRange(dates: Date[]): string {
  if (dates.length < 7) return "";
  const first = dates[0].getDate();
  const last = dates[6].getDate();
  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ];
  return `${first} - ${last} ${months[dates[0].getMonth()]}, ${dates[0].getFullYear()}`;
}

function getCurrentTimePosition(): number | null {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  if (h < START_HOUR || h >= START_HOUR + HOURS.length) return null;
  return ((h - START_HOUR) + m / 60) * HOUR_PX;
}

/* ─── Component ───────────────────────────────────────────── */

export function Dashboard() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [selectedTeacherId, setSelectedTeacherId] = useState("all");
  const [activeView, setActiveView] = useState("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [timePos, setTimePos] = useState<number | null>(getCurrentTimePosition());

  useEffect(() => {
    Promise.all([getAllSlots(), getTeachers(), getClasses()])
      .then(([s, t, c]) => { setSlots(s); setTeachers(t); setClasses(c); })
      .catch((err: any) => setError(err.message || "حدث خطأ أثناء تحميل البيانات"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimePos(getCurrentTimePosition()), 60_000);
    return () => clearInterval(id);
  }, []);

  const weekDates = useMemo(() => {
    const dates = getCurrentWeekDates();
    return dates.map((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + weekOffset * 7);
      return nd;
    });
  }, [weekOffset]);

  const today = new Date();
  const todayDayIndex = today.getDay();

  const filteredSlots = useMemo(() => {
    return slots.filter((s) => {
      if (selectedClassId !== "all" && s.class_id !== selectedClassId) return false;
      if (selectedTeacherId !== "all" && s.teacher_id !== selectedTeacherId) return false;
      return true;
    });
  }, [slots, selectedClassId, selectedTeacherId]);

  const slotsByDay = useMemo(() => {
    const map: Record<string, TimetableSlot[]> = {};
    DAYS.forEach((d) => (map[d.key] = []));
    filteredSlots.forEach((s) => { if (map[s.day]) map[s.day].push(s); });
    return map;
  }, [filteredSlots]);

  const colorMap = useMemo(() => {
    const m: Record<string, (typeof COLORS)[number]> = {};
    new Set(slots.map((s) => s.class_name)).forEach((name) => {
      m[name] = COLORS[hashString(name) % COLORS.length];
    });
    return m;
  }, [slots]);

  const gridHeight = HOURS.length * HOUR_PX;

  /* ─── Loading / Error ─── */
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <p style={{ color: "#6b7280", marginTop: 16 }}>جاري تحميل الجدول...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, color: "#3b82f6", cursor: "pointer", background: "none", border: "none", fontSize: 14 }}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 5rem)", margin: "-1rem -1rem -1.5rem -1.5rem", overflow: "hidden" }}>
      {/* ── Filters Toolbar ── */}
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
        gap: 16, padding: "12px 24px", background: "#fff", borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)", flexShrink: 0, zIndex: 20,
      }}>
        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Filter style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af", pointerEvents: "none" }} />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{
                appearance: "none", background: "#f9fafb", border: "1px solid #e5e7eb",
                color: "#374151", padding: "8px 40px 8px 32px", borderRadius: 8,
                fontSize: 14, cursor: "pointer", minWidth: 180,
              }}
            >
              <option value="all">جميع الصفوف</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af", pointerEvents: "none" }} />
          </div>
          <div style={{ position: "relative" }}>
            <User style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af", pointerEvents: "none" }} />
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              style={{
                appearance: "none", background: "#f9fafb", border: "1px solid #e5e7eb",
                color: "#374151", padding: "8px 40px 8px 32px", borderRadius: 8,
                fontSize: 14, cursor: "pointer", minWidth: 180,
              }}
            >
              <option value="all">جميع المعلمين</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <ChevronDown style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af", pointerEvents: "none" }} />
          </div>
        </div>

        {/* Week nav */}
        <div style={{
          display: "flex", alignItems: "center", background: "#f9fafb",
          borderRadius: 8, padding: 4, border: "1px solid #f3f4f6",
        }}>
          <button onClick={() => setWeekOffset((p) => p + 1)} style={{ padding: 6, borderRadius: 6, cursor: "pointer", background: "none", border: "none", color: "#6b7280" }}>
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
          <span style={{ padding: "0 16px", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
            {formatDateRange(weekDates)}
          </span>
          <button onClick={() => setWeekOffset((p) => p - 1)} style={{ padding: 6, borderRadius: 6, cursor: "pointer", background: "none", border: "none", color: "#6b7280" }}>
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", background: "#f3f4f6", padding: 4, borderRadius: 8 }}>
          {[{ key: "week", label: "أسبوع" }, { key: "day", label: "يوم" }, { key: "list", label: "قائمة" }].map((v) => (
            <button
              key={v.key}
              onClick={() => setActiveView(v.key)}
              style={{
                padding: "6px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500,
                cursor: "pointer", border: "none", transition: "all 0.2s",
                background: activeView === v.key ? "#fff" : "transparent",
                color: activeView === v.key ? "#2563eb" : "#6b7280",
                boxShadow: activeView === v.key ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Schedule Grid ── */}
      <div style={{ flex: 1, overflow: "auto", background: "#f9fafb", position: "relative" }}>
        <div style={{ minWidth: 1000, padding: 24 }}>
          {/* Day Headers */}
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
            <div style={{ width: 80, flexShrink: 0 }} />
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 16 }}>
              {DAYS.map((day, i) => {
                const isToday = weekOffset === 0 && i === todayDayIndex;
                const isWeekend = WEEKEND_DAYS.includes(day.key);
                return (
                  <div key={day.key} style={{ textAlign: "center", opacity: isWeekend ? 0.5 : 1 }}>
                    <span style={{
                      display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4,
                      color: isToday ? "#2563eb" : "#9ca3af", textTransform: "uppercase",
                    }}>
                      {day.label}
                    </span>
                    <div style={{
                      width: 32, height: 32, margin: "0 auto", display: "flex",
                      alignItems: "center", justifyContent: "center", borderRadius: "50%",
                      fontSize: 14, fontWeight: isToday ? 700 : 500, transition: "all 0.2s",
                      background: isToday ? "#2563eb" : "transparent",
                      color: isToday ? "#fff" : "#4b5563",
                      boxShadow: isToday ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
                    }}>
                      {weekDates[i]?.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid Body */}
          <div style={{ display: "flex", position: "relative", marginTop: 16 }}>
            {/* Time column */}
            <div style={{ width: 80, flexShrink: 0, borderLeft: "1px solid #f3f4f6", paddingRight: 8 }}>
              {HOURS.map((label, i) => (
                <div key={i} style={{ height: HOUR_PX, fontSize: 12, color: "#9ca3af", fontWeight: 500, paddingTop: 4 }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Grid content area */}
            <div style={{ flex: 1, position: "relative" }}>
              {/* Grid lines */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {HOURS.map((_, i) => (
                  <div key={i} style={{
                    height: HOUR_PX,
                    borderTop: `1px solid ${i === 0 ? "#e5e7eb" : "#f3f4f6"}`,
                  }} />
                ))}
              </div>

              {/* Current time indicator */}
              {weekOffset === 0 && timePos !== null && (
                <div style={{
                  position: "absolute", top: timePos, width: "100%",
                  borderTop: "2px solid #ef4444", zIndex: 10,
                  pointerEvents: "none", opacity: 0.6,
                }}>
                  <div style={{
                    position: "absolute", right: -6, top: -6,
                    width: 12, height: 12, background: "#ef4444",
                    borderRadius: "50%",
                  }} />
                </div>
              )}

              {/* Day columns with class blocks */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                gap: 16, height: gridHeight, position: "relative", zIndex: 0,
              }}>
                {DAYS.map((day) => {
                  const isWeekend = WEEKEND_DAYS.includes(day.key);

                  if (isWeekend) {
                    return (
                      <div key={day.key} style={{
                        position: "relative", height: "100%",
                        background: "rgba(249,250,251,0.5)", borderRadius: 8,
                      }}>
                        <div style={{
                          position: "absolute", inset: 0, display: "flex",
                          alignItems: "center", justifyContent: "center", opacity: 0.3,
                        }}>
                          <span style={{
                            transform: "rotate(-45deg)", color: "#d1d5db",
                            fontWeight: 700, fontSize: 20, letterSpacing: "0.1em",
                            whiteSpace: "nowrap",
                          }}>
                            عطلة نهاية الأسبوع
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const daySlots = slotsByDay[day.key] || [];

                  return (
                    <div key={day.key} style={{ position: "relative", height: "100%" }}>
                      {daySlots.map((slot) => {
                        const topOffset = timeToOffset(slot.start_time);
                        const endOffset = timeToOffset(slot.end_time);
                        const heightHours = endOffset - topOffset;
                        const color = colorMap[slot.class_name] || COLORS[0];

                        return (
                          <div
                            key={slot.id}
                            style={{
                              position: "absolute", width: "100%",
                              top: topOffset * HOUR_PX,
                              height: heightHours * HOUR_PX,
                              background: color.bg,
                              borderRight: `4px solid ${color.border}`,
                              borderRadius: 8, padding: 12,
                              cursor: "pointer",
                              transition: "box-shadow 0.2s",
                              overflow: "hidden",
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                              <div>
                                <p style={{ fontWeight: 700, color: color.title, fontSize: 14, lineHeight: 1.3, margin: 0 }}>
                                  {slot.class_name}
                                </p>
                                {slot.teacher_name && (
                                  <p style={{ fontSize: 12, color: color.sub, marginTop: 4, margin: "4px 0 0 0" }}>
                                    {slot.teacher_name}
                                  </p>
                                )}
                              </div>
                              {heightHours * HOUR_PX >= 80 && (
                                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: color.icon }}>
                                  <MapPin style={{ width: 12, height: 12 }} />
                                  <span>{slot.class_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filteredSlots.length === 0 && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              textAlign: "center", pointerEvents: "auto",
              background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
              borderRadius: 16, padding: 32, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              maxWidth: 360,
            }}>
              <div style={{
                width: 64, height: 64, background: "#dbeafe", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <CalendarDays style={{ width: 32, height: 32, color: "#2563eb" }} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#111827", marginBottom: 8 }}>
                لا توجد حصص
              </h3>
              <p style={{ color: "#6b7280", marginBottom: 16, fontSize: 14 }}>
                لم يتم إضافة أي حصص إلى الجدول بعد. ابدأ بإضافة حصة جديدة.
              </p>
              <a
                href="#/timetable"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#2563eb", color: "#fff", padding: "10px 16px",
                  borderRadius: 12, fontWeight: 500, fontSize: 14,
                  textDecoration: "none", boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                }}
              >
                <Plus style={{ width: 16, height: 16 }} />
                إضافة حصة
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
