import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { login } from "../services/authService";
import { LanguageSwitcher } from "../components/common/LanguageSwitcher";

export function LoginPage() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err: any) {
            setError(err.message || t("auth.loginError"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" dir={isRtl ? "rtl" : "ltr"}>
            <div className="w-full max-w-md px-4">
                {/* Language Switcher */}
                <div className="flex justify-end mb-4">
                    <LanguageSwitcher className="text-white" />
                </div>

                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">{t("common.appName")}</h1>
                    <p className="text-blue-200">{t("common.appDesc")}</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                        {t("auth.loginTitle")}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("common.email")}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder={t("auth.emailPlaceholder")}
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("common.password")}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder={t("auth.passwordPlaceholder")}
                                dir="ltr"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t("auth.loginLoading") : t("auth.loginButton")}
                        </button>
                    </form>

                    {/* Registration Links */}
                    <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
                        <p className="text-sm text-gray-600">{t("auth.noAccount")}</p>
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/register/teacher"
                                className="block w-full py-2.5 px-4 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-all text-sm"
                            >
                                {t("auth.registerTeacher")}
                            </Link>
                            <Link
                                to="/register/institution"
                                className="block w-full py-2.5 px-4 bg-violet-50 text-violet-700 font-medium rounded-xl hover:bg-violet-100 transition-all text-sm"
                            >
                                {t("auth.registerInstitution")}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-blue-200 mt-6 text-sm">
                    {t("common.copyright")}
                </p>
            </div>
        </div>
    );
}

