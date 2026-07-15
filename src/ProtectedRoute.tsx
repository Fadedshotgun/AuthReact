import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext.tsx';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { username, loading } = useAuthContext();
    if (loading) return <div>Loading...</div>;
    if (!username) return <Navigate to="/login" />;
    return <>{children}</>;
}