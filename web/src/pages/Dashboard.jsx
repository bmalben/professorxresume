import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAuth } from "../auth.jsx";
import { api } from "../api.js";

export default function Dashboard() {
  const theme = useTheme();
  const { user, refresh } = useAuth();
  const [summary, setSummary] = useState(null);
  const [summaryErr, setSummaryErr] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [title, setTitle] = useState(user?.title || "");
  const [company, setCompany] = useState(user?.company || "");
  const [profileErr, setProfileErr] = useState("");

  useEffect(() => {
    setTitle(user?.title || "");
    setCompany(user?.company || "");
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await api.dashboardSummary();
        if (!cancelled) setSummary(s);
      } catch (e) {
        if (!cancelled) setSummaryErr(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setProfileErr("");
    try {
      await api.patchProfile({ title, company });
      await refresh();
      setProfileOpen(false);
    } catch (ex) {
      setProfileErr(ex.message);
    }
  }

  const chartData =
    summary?.trends?.map((t) => ({
      name: t.date,
      score: t.score,
    })) || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hi {user?.name}. Jump into AI tools or review your progress.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" size="small" onClick={() => setProfileOpen((v) => !v)}>
            Profile
          </Button>
          <Button variant="contained" component={RouterLink} to="/ai-tools">
            AI Tools
          </Button>
        </Stack>
      </Stack>

      {profileOpen && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, maxWidth: 480 }}>
          <Box component="form" onSubmit={saveProfile}>
            {profileErr && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {profileErr}
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth size="small" />
              <TextField
                label="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                fullWidth
                size="small"
              />
              <Button type="submit" variant="contained" size="small">
                Save
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total interviews", value: summary?.totalInterviews ?? "—" },
          { label: "Average score", value: summary?.averageScore ?? "—" },
          {
            label: "Success rate (≥70)",
            value: summary?.successRate != null ? `${summary.successRate}%` : "—",
          },
        ].map((item) => (
          <Card key={item.label} variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.5 }}>
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {summaryErr && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {summaryErr}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Score trend (recent completed)
        </Typography>
        {chartData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Complete a mock interview to see trends.
          </Typography>
        ) : (
          <Box sx={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
