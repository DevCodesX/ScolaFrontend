import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
    const { i18n, t } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === "ar" ? "en" : "ar";
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${className}`}
            style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                color: "inherit",
                border: "1px solid rgba(255,255,255,0.2)",
            }}
            title={t("common.switchLang")}
        >
            <Globe style={{ width: 16, height: 16 }} />
            <span>{t("common.switchLang")}</span>
        </button>
    );
}
