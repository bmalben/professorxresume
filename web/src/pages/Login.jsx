import { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../auth.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav(loc.state?.from || "/dashboard", { replace: true });
    } catch (ex) {
      setErr(ex.message);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography 
        variant="h5" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600, 
          color: "#ffffff" 
        }}
      >
        Log in
      </Typography>
      
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 3, 
          mt: 2, 
          bgcolor: "rgba(0,0,0,0.6)", 
          backdropFilter: "blur(10px)",
          borderColor: "rgba(255,255,255,0.2)"
        }}
      >
        <Box component="form" onSubmit={onSubmit}>
          {err && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
          )}
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
              sx={{
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#ffffff" },
                "& .MuiOutlinedInput-root": {
                  color: "#ffffff",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                  "&.Mui-focused fieldset": { borderColor: "#ffffff" }
                }
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
              sx={{
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#ffffff" },
                "& .MuiOutlinedInput-root": {
                  color: "#ffffff",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                  "&.Mui-focused fieldset": { borderColor: "#ffffff" }
                }
              }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              fullWidth
              sx={{ 
                bgcolor: "#ffffff", 
                color: "primary.main",
                "&:hover": { bgcolor: "#f5f5f5" }
              }}
            >
              Log in
            </Button>
          </Stack>
        </Box>
      </Paper>
      
      <Typography 
        variant="body2" 
        sx={{ 
          mt: 2, 
          color: "#ffffff", 
          opacity: 0.9 
        }}
      >
        No account?{" "}
        <Link 
          component={RouterLink} 
          to="/register"
          sx={{ 
            color: "#ffffff", 
            textDecorationColor: "rgba(255,255,255,0.5)",
            "&:hover": { color: "#f5f5f5" }
          }}
        >
          Register
        </Link>
        {" · "}
        <Link 
          component={RouterLink} 
          to="/"
          sx={{ 
            color: "#ffffff", 
            textDecorationColor: "rgba(255,255,255,0.5)",
            "&:hover": { color: "#f5f5f5" }
          }}
        >
          Home
        </Link>
      </Typography>
    </Container>
  );
}