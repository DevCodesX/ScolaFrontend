import React, { createContext, useContext, ReactNode } from "react";

type InstitutionContextType = {
    institutionId: string;
};

const InstitutionContext = createContext<InstitutionContextType | null>(null);

// Temporarily using a hardcoded ID (the one from MySQL)
export const InstitutionProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <InstitutionContext.Provider
            value={{ institutionId: "38a528ed-fc3e-11f0-b4b7-18c04d959fba" }}
        >
            {children}
        </InstitutionContext.Provider>
    );
};

export function useInstitution() {
    const context = useContext(InstitutionContext);
    if (!context) {
        throw new Error("useInstitution must be used inside InstitutionProvider");
    }
    return context;
}
