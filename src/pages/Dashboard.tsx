import React, { useEffect, useState, useMemo } from "react";
import {
  Filter,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FlaskConical,
  Monitor,
  Dribbble,
  Plus,
  CalendarDays,
} from "lucide-react";
import { getAllSlots, TimetableSlot } from "../services/timetable";
import { getTeachers, Teacher } from "../services/teachers";
import { getClasses, Class } from "../services/classes";

// ─── Day configuration ───
const DAYS = [
  { key: "sun", label: "الأحد" },
  { key: "mon", label: "الإثنين" },
  { key: "tue", label: "الثلاثاء" },
  { key: "wed", label: "الأربعاء" },
  { key: "thu", label: "الخميس" },
  { key: "fri", label: "الجمعة" },
  { key: "sat", label: "السبت" },
] as const;

const WEEKEND_DAYS = ["fri", "sat"];

// Hour labels displayed in the time column
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

const START_HOUR = 8; // grid starts at 08:00
const HOUR_HEIGHT_REM = 6; // each hour = 6rem (h-24 equivalent)

// ─── Color palette for class blocks ───
const COLORS = [
  {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-500",
    title: "text-blue-900 dark:text-blue-100",
    sub: "text-blue-700 dark:text-blue-300",
    icon: "text-blue-600 dark:text-blue-400",
  },
  {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-500",
    title: "text-emerald-900 dark:text-emerald-100",
    sub: "text-emerald-700 dark:text-emerald-300",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-500",
    title: "text-purple-900 dark:text-purple-100",
    sub: "text-purple-700 dark:text-purple-300",
    icon: "text-purple-600 dark:text-purple-400",
  },
  {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-500",
    title: "text-amber-900 dark:text-amber-100",
    sub: "text-amber-700 dark:text-amber-300",
    icon: "text-amber-600 dark:text-amber-400",
  },
  {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-500",
    title: "text-rose-900 dark:text-rose-100",
    sub: "text-rose-700 dark:text-rose-300",
    icon: "text-rose-600 dark:text-rose-400",
  },
  {
    bg: "bg-teal-50 dark:bg-teal-900/20",
    border: "border-teal-500",
    title: "text-teal-900 dark:text-teal-100",
    sub: "text-teal-700 dark:text-teal-300",
    icon: "text-teal-600 dark:text-teal-400",
  },
  {
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    border: "border-cyan-500",
    title: "text-cyan-900 dark:text-cyan-100",
    sub: "text-cyan-700 dark:text-cyan-300",
    icon: "text-cyan-600 dark:text-cyan-400",
  },
  {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-500",
    title: "text-indigo-900 dark:text-indigo-100",
    sub: "text-indigo-700 dark:text-indigo-300",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-500",
    title: "text-pink-900 dark:text-pink-100",
    sub: "text-pink-700 dark:text-pink-300",
    icon: "text-pink-600 dark:text-pink-400",
  },
  {
    bg: "bg-lime-50 dark:bg-lime-900/20",
    border: "border-lime-500",
    title: "text-lime-900 dark:text-lime-100",
    sub: "text-lime-700 dark:text-lime-300",
    icon: "text-lime-600 dark:text-lime-400",
  },
];

// ─── Helpers ───

/** Parse "HH:MM" or "HH:MM:SS" into fractional hours from START_HOUR */
function timeToOffset(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - START_HOUR) + m / 60;
}

/** Stable color index for a class_name */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Get the current week's Sunday–Saturday date range */
function getCurrentWeekDates(): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
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
  const month = months[dates[0].getMonth()];
  const year = dates[0].getFullYear();
  return `${first} - ${last} ${month}, ${year}`;
}

/** Current time indicator position in rem from top */
function getCurrentTimePosition(): number | null {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  if (h < START_HOUR || h >= START_HOUR + HOURS.length) return null;
  return ((h - START_HOUR) + m / 60) * HOUR_HEIGHT_REM;
}

// ─── Main Component ───

export function Dashboard() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");
  const [activeView, setActiveView] = useState<"week" | "day" | "list">("week");

  // Week navigation
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [slotsData, teachersData, classesData] = await Promise.all([
          getAllSlots(),
          getTeachers(),
          getClasses(),
        ]);
        setSlots(slotsData);
        setTeachers(teachersData);
        setClasses(classesData);
      } catch (err: any) {
        setError(err.message || "حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Get current week dates adjusted by offset
  const weekDates = useMemo(() => {
    const dates = getCurrentWeekDates();
    return dates.map((d) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + weekOffset * 7);
      return nd;
    });
  }, [weekOffset]);

  const today = new Date();
  const todayDayIndex = today.getDay(); // 0=Sun

  // Filtered slots
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      if (selectedClassId !== "all" && slot.class_id !== selectedClassId) return false;
      if (selectedTeacherId !== "all" && slot.teacher_id !== selectedTeacherId) return false;
      return true;
    });
  }, [slots, selectedClassId, selectedTeacherId]);

  // Group slots by day
  const slotsByDay = useMemo(() => {
    const map: Record<string, TimetableSlot[]> = {};
    DAYS.forEach((d) => (map[d.key] = []));
    filteredSlots.forEach((slot) => {
      if (map[slot.day]) map[slot.day].push(slot);
    });
    return map;
  }, [filteredSlots]);

  // Color mapping: assign a consistent color to each unique class_name
  const colorMap = useMemo(() => {
    const nameSet = new Set(slots.map((s) => s.class_name));
    const m: Record<string, (typeof COLORS)[number]> = {};
    nameSet.forEach((name) => {
      m[name] = COLORS[hashString(name) % COLORS.length];
    });
    return m;
  }, [slots]);

  // Current time position for the indicator
  const [timePos, setTimePos] = useState<number | null>(getCurrentTimePosition());
  useEffect(() => {
    const interval = setInterval(() => setTimePos(getCurrentTimePosition()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ─── Render ───
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">جاري تحميل الجدول...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden -m-4 lg:-m-6">
      {/* ── Filters Toolbar ── */}
      <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-20 flex-none">
        {/* Left filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Class filter */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pr-10 pl-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-48 cursor-pointer"
            >
              <option value="all">جميع الصفوف</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {/* Teacher filter */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pr-10 pl-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-48 cursor-pointer"
            >
              <option value="all">جميع المعلمين</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Week navigation (center) */}
        <div className="hidden lg:flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-1 border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm text-gray-500 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="px-4 text-sm font-semibold whitespace-nowrap">
            {formatDateRange(weekDates)}
          </span>
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm text-gray-500 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* View toggle (right) */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {([
            { key: "week" as const, label: "أسبوع" },
            { key: "day" as const, label: "يوم" },
            { key: "list" as const, label: "قائمة" },
          ]).map((v) => (
            <button
              key={v.key}
              onClick={() => setActiveView(v.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === v.key
                  ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Schedule Grid ── */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900/50 relative">
        <div className="min-w-[1000px] h-full flex flex-col p-6">
          {/* Day headers */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2">
            {/* Time column spacer */}
            <div className="w-20 flex-shrink-0"></div>
            {/* Day columns */}
            <div className="grid grid-cols-7 flex-1 gap-4">
              {DAYS.map((day, i) => {
                const isToday = weekOffset === 0 && i === todayDayIndex;
                const isWeekend = WEEKEND_DAYS.includes(day.key);
                return (
                  <div key={day.key} className={`text-center group ${isWeekend ? "opacity-50" : ""}`}>
                    <span
                      className={`block text-xs uppercase font-bold mb-1 ${isToday ? "text-blue-600" : "text-gray-400"
                        }`}
                    >
                      {day.label}
                    </span>
                    <div
                      className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-colors ${isToday
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold"
                          : "text-gray-600 dark:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
                        }`}
                    >
                      {weekDates[i]?.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule grid body */}
          <div className="flex flex-1 relative mt-4">
            {/* Time column */}
            <div className="w-20 flex-shrink-0 flex flex-col text-xs text-gray-400 font-medium pt-3 pr-2 border-l border-gray-100 dark:border-gray-800/50">
              {HOURS.map((label, i) => (
                <div
                  key={i}
                  style={{ height: `${HOUR_HEIGHT_REM}rem` }}
                  className="flex-none"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grid content */}
            <div className="flex-1 relative">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col pointer-events-none">
                {HOURS.map((_, i) => (
                  <div
                    key={i}
                    style={{ height: `${HOUR_HEIGHT_REM}rem` }}
                    className={`flex-none border-t ${i === 0
                        ? "border-gray-200 dark:border-gray-800"
                        : "border-gray-100 dark:border-gray-800"
                      }`}
                  />
                ))}
              </div>

              {/* Current time indicator */}
              {weekOffset === 0 && timePos !== null && (
                <div
                  className="absolute w-full border-t-2 border-red-500 z-10 flex items-center pointer-events-none opacity-60"
                  style={{ top: `${timePos}rem` }}
                >
                  <div className="absolute -right-1.5 w-3 h-3 bg-red-500 rounded-full" />
                </div>
              )}

              {/* Class blocks grid */}
              <div className="grid grid-cols-7 h-full gap-4 relative z-0">
                {DAYS.map((day) => {
                  const isWeekend = WEEKEND_DAYS.includes(day.key);

                  if (isWeekend) {
                    return (
                      <div
                        key={day.key}
                        className="relative h-full bg-gray-50/50 dark:bg-gray-800/20 rounded-lg"
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          <span className="transform -rotate-45 text-gray-300 dark:text-gray-600 font-bold text-2xl tracking-widest whitespace-nowrap">
                            عطلة نهاية الأسبوع
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const daySlots = slotsByDay[day.key] || [];

                  return (
                    <div key={day.key} className="relative h-full">
                      {daySlots.map((slot) => {
                        const topOffset = timeToOffset(slot.start_time);
                        const endOffset = timeToOffset(slot.end_time);
                        const height = endOffset - topOffset;
                        const color = colorMap[slot.class_name] || COLORS[0];

                        return (
                          <div
                            key={slot.id}
                            className={`absolute w-full ${color.bg} border-r-4 ${color.border} rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer`}
                            style={{
                              top: `${topOffset * HOUR_HEIGHT_REM}rem`,
                              height: `${height * HOUR_HEIGHT_REM}rem`,
                            }}
                          >
                            <div className="flex flex-col h-full justify-between overflow-hidden">
                              <div>
                                <p className={`font-bold ${color.title} text-sm leading-tight`}>
                                  {slot.class_name}
                                </p>
                                {slot.teacher_name && (
                                  <p className={`text-xs ${color.sub} mt-1`}>
                                    {slot.teacher_name}
                                  </p>
                                )}
                              </div>
                              {height * HOUR_HEIGHT_REM >= 6 && (
                                <div className={`flex items-center gap-1 text-xs ${color.icon}`}>
                                  <MapPin className="w-3 h-3" />
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

        {/* Empty state — no slots at all */}
        {filteredSlots.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center pointer-events-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-2xl p-8 shadow-lg max-w-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد حصص
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                لم يتم إضافة أي حصص إلى الجدول بعد. ابدأ بإضافة حصة جديدة.
              </p>
              <a
                href="#/timetable"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 text-sm"
              >
                <Plus className="w-4 h-4" />
                إضافة حصة
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
