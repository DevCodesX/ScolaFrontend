import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, Mail, Lock, User, ArrowLeft, CheckCircle } from "lucide-react";
import { registerInstitution } from "../services/iamService";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";

export function InstitutionRegisterPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRtl = i18n.language === "ar";

    const [form, setForm] = useState({
        institution_name: "",
        admin_name: "",
        admin_email: "",
        admin_password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (form.admin_password !== form.confirmPassword) {
            setError(t("teacherRegister.passwordMismatch"));
            return;
        }

        if (form.admin_password.length < 6) {
            setError(t("teacherRegister.passwordTooShort"));
            return;
        }

        setLoading(true);
        try {
            await registerInstitution({
                institution_name: form.institution_name,
                admin_name: form.admin_name,
                admin_email: form.admin_email,
                admin_password: form.admin_password,
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800" dir={isRtl ? "rtl" : "ltr"}>
                <div className="w-full max-w-md text-center">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
                        <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">{t("institutionRegister.successTitle")}</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">{t("institutionRegister.successMessage")}</p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                            {t("auth.loginNow")}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 py-8 px-4" dir={isRtl ? "rtl" : "ltr"}>
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
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">{t("institutionRegister.title")}</h1>
                    <p className="text-violet-100">{t("institutionRegister.subtitle")}</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Institution Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <Building2 className="w-4 h-4 inline-block ml-1 text-gray-400" />
                                {t("institutionRegister.institutionName")}
                            </label>
                            <input
                                type="text" name="institution_name" value={form.institution_name} onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                dir={isRtl ? "rtl" : "ltr"}
                            />
                        </div>

                        {/* Admin Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <User className="w-4 h-4 inline-block ml-1 text-gray-400" />
                                {t("institutionRegister.adminName")}
                            </label>
                            <input
                                type="text" name="admin_name" value={form.admin_name} onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                dir={isRtl ? "rtl" : "ltr"}
                            />
                        </div>

                        {/* Admin Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                <Mail className="w-4 h-4 inline-block ml-1 text-gray-400" />
                                {t("institutionRegister.adminEmail")}
                            </label>
                            <input
                                type="email" name="admin_email" value={form.admin_email} onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                placeholder={t("auth.emailPlaceholder")} dir="ltr"
                            />
                        </div>

                        {/* Password row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <Lock className="w-4 h-4 inline-block ml-1 text-gray-400" />
                                    {t("institutionRegister.adminPassword")}
                                </label>
                                <input
                                    type="password" name="admin_password" value={form.admin_password} onChange={handleChange}
                                    required minLength={6}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {t("institutionRegister.confirmPassword")}
                                </label>
                                <input
                                    type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                                    required minLength={6}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit" disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? t("institutionRegister.registering") : t("institutionRegister.registerButton")}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            {t("auth.hasAccount")}{" "}
                            <Link to="/login" className="text-violet-600 font-medium hover:underline">
                                {t("auth.loginNow")}
                            </Link>
                        </p>
                        <p className="text-sm text-gray-500">
                            <Link to="/register/teacher" className="text-purple-600 font-medium hover:underline">
                                {t("auth.registerTeacher")}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-violet-100 mt-6 text-sm">{t("common.copyright")}</p>
            </div>
        </div>
    );
}
