import { createContext, type ReactNode, useContext, useState } from "react";
import type { AuthResponse, AuthUser } from "../types/auth";
import {
    clearAuth,
    getAuthUser,
    saveAuth,
    updateStoredUserCredits,
} from "../components/helper/authStorage";

type AuthContextType = {
    user: AuthUser | null;
    login: (auth: AuthResponse) => void;
    logout: () => void;
    updateCredits: (credits: number) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(getAuthUser());

    function login(auth: AuthResponse) {
        const savedUser = saveAuth(auth);
        setUser(savedUser);
    }

    function logout() {
        clearAuth();
        setUser(null);
    }

    function updateCredits(credits: number) {
        const updatedUser = updateStoredUserCredits(credits);
        setUser(updatedUser);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                updateCredits,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}