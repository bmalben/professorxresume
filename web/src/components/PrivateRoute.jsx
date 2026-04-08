import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../auth.jsx";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={28} sx={{ mr: 1, verticalAlign: "middle" }} />
        <Typography component="span" variant="body2" color="text.secondary">
          Loading
        </Typography>
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}
