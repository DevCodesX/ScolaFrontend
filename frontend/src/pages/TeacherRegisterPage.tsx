import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GraduationCap, Mail, Lock, User, BookOpen, Award, ArrowLeft, CheckCircle } from "lucide-react";
import { registerTeacher } from "../services/iamService";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";

export function TeacherRegisterPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRtl = i18n.language === "ar";

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        qualifications: "",
        subject: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const qualificationOptions = [
        { value: "bachelors", label: t("teacherRegister.qualificationOptions.bachelors") },
        { value: "masters", label: t("teacherRegister.qualificationOptions.masters") },
        { value: "doctorate", label: t("teacherRegister.qualificationOptions.doctorate") },
        { value: "diploma", label: t("teacherRegister.qualificationOptions.diploma") },
        { value: "other", label: t("teacherRegister.qualificationOptions.other") },
    ];

    const subjectOptions = [
        { value: "math", label: t("teacherRegister.subjectOptions.math") },
        { value: "science", label: t("teacherRegister.subjectOptions.science") },
        { value: "arabic", label: t("teacherRegister.subjectOptions.arabic") },
        { value: "english", label: t("teacherRegister.subjectOptions.english") },
        { value: "physics", label: t("teacherRegister.subjectOptions.physics") },
        { value: "chemistry", label: t("teacherRegister.subjectOptions.chemistry") },
        { value: "biology", label: t("teacherRegister.subjectOptions.biology") },
        { value: "history", label: t("teacherRegister.subjectOptions.history") },
        { value: "geography", label: t("teacherRegister.subjectOptions.geography") },
        { value: "islamicStudies", label: t("teacherRegister.subjectOptions.islamicStudies") },
        { value: "computerScience", label: t("teacherRegister.subjectOptions.computerScience") },
        { value: "other", label: t("teacherRegister.subjectOptions.other") },
    ];

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError(t("teacherRegister.passwordMismatch"));
            return;
        }

        if (form.password.length < 6) {
            setError(t("teacherRegister.passwordTooShort"));
            return;
        }

        setLoading(true);
        try {
            await registerTeacher({
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                password: form.password,
                qualifications: form.qualifications,
                subject: form.subject,
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800" dir={isRtl ? "rtl" : "ltr"}>
                <div className="w-full max-w-md text-center">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">{t("teacherRegister.successTitle")}</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">{t("teacherRegister.successMessage")}</p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                        >
                            {t("auth.loginNow")}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 py-8 px-4" dir={isRtl ? "rtl" : "ltr"}>
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <Link to="/login" className="text-white/80 hover:text-white transition-colors flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">{t("common.back")}</span>
                    </Link>
                    <LanguageSwitcher className="text-white" />
                </div>

                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">{t("teacherRegister.title")}</h1>
                    <p className="text-emerald-100">{t("teacherRegister.subtitle")}</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <User className="w-4 h-4 inline-block ml-1 text-gray-400" />
                                    {t("teacherRegister.firstName")}
                                </label>
                                <input
                                    type="text" name="first_name" value={form.first_name} onChange={handleChange}
                                    required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                                    dir={isRtl ? "rtl" : "ltr"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t("teacherRegister.lastName")}
                                </label>
                                <input
                                    type="text" name="last_name" value={form.last_name} onChange={handleChange}
                                    required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                                    dir={isRtl ? "rtl" : "ltr"}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <Mail className="w-4 h-4 inline-block ml-1 text-gray-400" />
                                {t("teacherRegister.email")}
                            </label>
                            <input
                                type="email" name="email" value={form.email} onChange={handleChange}
                                required className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                                placeholder={t("auth.emailPlaceholder")} dir="ltr"
                            />
                        </div>

                        {/* Password row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Lock className="w-4 h-4 inline-block ml-1 text-gray-400" />
                                    {t("teacherRegister.password")}
                                </label>
                                <input
                                    type="password" name="password" value={form.password} onChange={handleChange}
                                    required minLength={6}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t("teacherRegister.confirmPassword")}
                                </label>
                                <input
                                    type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                                    required minLength={6}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Qualifications */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <Award className="w-4 h-4 inline-block ml-1 text-gray-400" />
                                {t("teacherRegister.qualifications")}
                            </label>
                            <select
                                name="qualifications" value={form.qualifications} onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm bg-white"
                            >
                                <option value="">{t("teacherRegister.qualifications")}</option>
                                {qualificationOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <BookOpen className="w-4 h-4 inline-block ml-1 text-gray-400" />
                                {t("teacherRegister.subject")}
                            </label>
                            <select
                                name="subject" value={form.subject} onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm bg-white"
                            >
                                <option value="">{t("teacherRegister.subject")}</option>
                                {subjectOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit" disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? t("teacherRegister.registering") : t("teacherRegister.registerButton")}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            {t("auth.hasAccount")}{" "}
                            <Link to="/login" className="text-emerald-600 font-medium hover:underline">
                                {t("auth.loginNow")}
                            </Link>
                        </p>
                        <p className="text-sm text-gray-500">
                            <Link to="/register/institution" className="text-teal-600 font-medium hover:underline">
                                {t("auth.registerInstitution")}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-emerald-100 mt-6 text-sm">{t("common.copyright")}</p>
            </div>
        </div>
    );
}
