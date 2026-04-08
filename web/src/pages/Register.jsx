import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register({ name, email, password });
      nav("/dashboard", { replace: true });
    } catch (ex) {
      setErr(ex.message);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Register
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
        <Box component="form" onSubmit={onSubmit}>
          {err && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
          )}
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoComplete="name"
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              inputProps={{ minLength: 8 }}
              autoComplete="new-password"
              helperText="At least 8 characters."
            />
            <Button type="submit" variant="contained" size="large" fullWidth>
              Create account
            </Button>
          </Stack>
        </Box>
      </Paper>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Already have an account?{" "}
        <Link component={RouterLink} to="/login">
          Log in
        </Link>
        {" · "}
        <Link component={RouterLink} to="/">
          Home
        </Link>
      </Typography>
    </Container>
  );
}
