import React, { createContext, useContext } from "react";
import { getUser } from "../services/authService";

type InstitutionContextType = {
    institutionId: string;
    institutionName: string;
};

const InstitutionContext = createContext<InstitutionContextType | null>(null);

export const InstitutionProvider = ({ children }: { children: React.ReactNode }) => {
    const user = getUser();
    const value: InstitutionContextType = {
        institutionId: user?.institutionId || "",
        institutionName: user?.institutionName || "",
    };

    return (
        <InstitutionContext.Provider value={value}>
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
