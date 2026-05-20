import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

import type { Role, AuthUser } from "../types/auth";

type AuthContextValue = {
    user: AuthUser | null;
    login: (user: AuthUser) => void;
    logout: () => void;
    updateCredits: (credits: number) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as AuthUser;
    } catch (err) {
        console.error("Failed to parse stored user", err);
        localStorage.removeItem("user");
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(getStoredUser());

    function login(user: AuthUser) {
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
    }

    function logout() {
        localStorage.removeItem("user");
        setUser(null);
    }

    function updateCredits(credits: number) {
        setUser((currentUser) => {
            if (!currentUser) {
                return null;
            }

            const updatedUser = {
                ...currentUser,
                credits,
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));

            return updatedUser;
        });
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