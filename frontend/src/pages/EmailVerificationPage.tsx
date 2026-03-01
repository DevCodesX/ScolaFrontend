import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { verifyEmail } from "../services/iamService";

export function EmailVerificationPage() {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const isRtl = i18n.language === "ar";

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage(t("emailVerification.error"));
            return;
        }

        verifyEmail(token)
            .then(() => {
                setStatus("success");
                setMessage(t("emailVerification.success"));
            })
            .catch((err) => {
                setStatus("error");
                setMessage(err.message || t("emailVerification.error"));
            });
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" dir={isRtl ? "rtl" : "ltr"}>
            <div className="w-full max-w-md text-center">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
                    {status === "loading" && (
                        <>
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">{t("emailVerification.title")}</h2>
                            <p className="text-gray-500">{t("emailVerification.verifying")}</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">{message}</h2>
                            <p className="text-gray-600 mb-6">{t("emailVerification.successMessage")}</p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                            >
                                {t("emailVerification.loginButton")}
                            </Link>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">{t("emailVerification.error")}</h2>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                            >
                                {t("auth.loginNow")}
                            </Link>
                        </>
                    )}
                </div>

                <p className="text-center text-blue-100 mt-6 text-sm">{t("common.copyright")}</p>
            </div>
        </div>
    );
}
