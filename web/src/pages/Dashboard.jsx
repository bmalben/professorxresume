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
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: "#ffffff" }}>
            Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "#ffffff", opacity: 0.85 }}>
            Hi {user?.name}. Jump into AI tools or review your progress.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setProfileOpen((v) => !v)}
            sx={{ 
              color: "#ffffff", 
              borderColor: "rgba(255,255,255,0.5)",
              "&:hover": { borderColor: "#ffffff", bgcolor: "rgba(255,255,255,0.1)" }
            }}
          >
            Profile
          </Button>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/ai-tools"
            sx={{ 
              bgcolor: "#ffffff", 
              color: "primary.main",
              "&:hover": { bgcolor: "#f5f5f5" }
            }}
          >
            AI Tools
          </Button>
        </Stack>
      </Stack>

      {profileOpen && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mb: 3, 
            maxWidth: 480, 
            bgcolor: "rgba(0,0,0,0.6)", 
            backdropFilter: "blur(10px)",
            borderColor: "rgba(255,255,255,0.2)"
          }}
        >
          <Box component="form" onSubmit={saveProfile}>
            {profileErr && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {profileErr}
              </Alert>
            )}
            <Stack spacing={2}>
              <TextField 
                label="Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                fullWidth 
                size="small"
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
                label="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                fullWidth
                size="small"
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
                size="small"
                sx={{ 
                  bgcolor: "#ffffff", 
                  color: "primary.main",
                  "&:hover": { bgcolor: "#f5f5f5" }
                }}
              >
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
          <Card 
            key={item.label} 
            variant="outlined" 
            sx={{ 
              flex: 1, 
              minWidth: 0, 
              bgcolor: "rgba(0,0,0,0.6)", 
              backdropFilter: "blur(10px)",
              borderColor: "rgba(255,255,255,0.2)"
            }}
          >
            <CardContent>
              <Typography variant="caption" sx={{ color: "#ffffff", opacity: 0.7 }}>
                {item.label}
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.5, color: "#ffffff" }}>
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

      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          bgcolor: "rgba(0,0,0,0.6)", 
          backdropFilter: "blur(10px)",
          borderColor: "rgba(255,255,255,0.2)"
        }}
      >
        <Typography variant="subtitle2" gutterBottom sx={{ color: "#ffffff", opacity: 0.85 }}>
          Score trend (recent completed)
        </Typography>
        {chartData.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#ffffff", opacity: 0.7 }}>
            Complete a mock interview to see trends.
          </Typography>
        ) : (
          <Box sx={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: "#ffffff" }} 
                  stroke="rgba(255,255,255,0.3)"
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 11, fill: "#ffffff" }} 
                  stroke="rgba(255,255,255,0.3)"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(0,0,0,0.8)", 
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "#ffffff"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ fill: theme.palette.primary.main }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Container>
  );
}