import { Navigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}
