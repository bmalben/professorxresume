import { Link as RouterLink, Navigate, Route, Routes } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuth } from "./auth.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AiTools from "./pages/AiTools.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Admin from "./pages/Admin.jsx";

function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: "rgba(15, 23, 42, 0.85)", 
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          color: "white"
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, py: 0.5 }}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: { xs: 1, sm: 0 },
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Professor X
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {user ? (
              <>
                {user.role === "admin" && (
                  <Button color="inherit" component={RouterLink} to="/admin" sx={{ fontWeight: 'bold' }}>
                    Admin Panel
                  </Button>
                )}
                <Button color="inherit" component={RouterLink} to="/dashboard">
                  Dashboard
                </Button>
                <Button color="inherit" component={RouterLink} to="/ai-tools">
                  AI Tools
                </Button>
                <Button color="inherit" variant="outlined" onClick={logout} sx={{ borderColor: "rgba(255,255,255,0.5)" }}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login">
                  Log in
                </Button>
                <Button color="inherit" variant="contained" component={RouterLink} to="/register" sx={{ bgcolor: "background.paper", color: "primary.main", "&:hover": { bgcolor: "grey.100" } }}>
                  Register
                </Button>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <Layout>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/ai-tools"
          element={
            <PrivateRoute>
              <AiTools />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
