import { createContext, useContext, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL

interface AuthContextType {
    username: string | null;
    userId: string | null;
    loading: boolean;
    refetch: () => void;
}

const AuthContext = createContext<AuthContextType>({ username: null, userId: null, loading: true, refetch: () => { } })

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [username, setUsername] = useState<string | null>(null);
     const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = () => {
        fetch(`${API}/api/user/me`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setUsername(data?.username ?? null);
                setUserId(data?.id ?? null);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchUser();
    }, [])

    return (
        <AuthContext.Provider value={{ username, userId, loading, refetch: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => useContext(AuthContext);