import { useCallback, useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { api } from "../api.js";
import AiPanel from "../components/AiPanel.jsx";
import MarkdownContent from "../components/MarkdownContent.jsx";

function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AiTools() {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          AI Tools
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="outlined" size="small">
          Dashboard
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tab label="Job role intel" />
        <Tab label="Mock interview" />
        <Tab label="English" />
      </Tabs>

      {tab === 0 && <TabJobIntel />}
      {tab === 1 && <TabMockInterview />}
      {tab === 2 && <TabEnglish />}
    </Container>
  );
}

function TabJobIntel() {
  const [role, setRole] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");

  async function onGenerate(e) {
    e.preventDefault();
    setError("");
    setContent("");
    setLoading(true);
    try {
      const data = await api.jobIntel({ jobRole: role, jobDescription: desc });
      setContent(data.content || "");
    } catch (ex) {
      setError(ex.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter a role and optional description. Output is generated on the server with Gemini.
      </Typography>
      <Box component="form" onSubmit={onGenerate}>
        <Stack spacing={2}>
          <TextField
            label="Job role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Job description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            fullWidth
            multiline
            minRows={4}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            Generate
          </Button>
        </Stack>
      </Box>
      <AiPanel title="Gemini — job intelligence" loading={loading} error={error}>
        {content && <MarkdownContent>{content}</MarkdownContent>}
      </AiPanel>
    </Box>
  );
}

function TabMockInterview() {
  const [jobRole, setJobRole] = useState("");
  const [file, setFile] = useState(null);
  const [interviewId, setInterviewId] = useState("");
  const [thread, setThread] = useState([]);
  const [progress, setProgress] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  async function refreshState(id) {
    const data = await api.getInterview(id);
    const th = data.thread || [];
    setThread(th);
    setProgress(data.progress);
    const pending = th.filter((t) => !t.response);
    const cq = pending.length ? pending[0] : null;
    setCurrentQuestion(cq);
    if (data.interview?.status === "completed") {
      stopTimer();
    }
    return data;
  }

  async function startInterview(e) {
    e.preventDefault();
    setErr("");
    setResult(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("jobRole", jobRole);
      if (file) fd.append("resume", file);
      const data = await api.createInterview(fd);
      const newId = data.interview._id;
      setInterviewId(newId);
      await refreshState(newId);
      await api.nextQuestion(newId);
      await refreshState(newId);
      startTimer();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  async function nextQuestion() {
    if (!interviewId) return;
    setErr("");
    setBusy(true);
    try {
      await api.nextQuestion(interviewId);
      await refreshState(interviewId);
      setAnswer("");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer(e) {
    e.preventDefault();
    if (!interviewId || !currentQuestion) return;
    setErr("");
    setBusy(true);
    try {
      await api.submitAnswer(interviewId, {
        questionId: currentQuestion.id,
        answer,
      });
      await refreshState(interviewId);
      setAnswer("");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  async function completeInterview() {
    if (!interviewId) return;
    setErr("");
    setBusy(true);
    try {
      const data = await api.completeInterview(interviewId);
      setResult(data.result);
      await refreshState(interviewId);
      stopTimer();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  const pct = progress?.percent ?? 0;
  const target = progress?.target ?? 8;
  const atQuestionLimit = thread.length >= target;
  const mustAnswerFirst = Boolean(currentQuestion);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload a resume (PDF, DOCX, or TXT). Each question is generated by Gemini from your role and resume.
      </Typography>
      <Box component="form" onSubmit={startInterview} sx={{ mb: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Job role"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            required
            fullWidth
          />
          <Button variant="outlined" component="label" sx={{ alignSelf: "flex-start" }}>
            {file ? file.name : "Choose resume file"}
            <input
              type="file"
              hidden
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Button>
          <Button type="submit" variant="contained" disabled={busy}>
            Start session
          </Button>
        </Stack>
      </Box>

      {interviewId && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Question progress
          </Typography>
          <LinearProgress variant="determinate" value={pct} sx={{ mt: 1, mb: 1, height: 8, borderRadius: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {progress?.answered ?? 0} / {target} answered
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="contained"
                disabled={busy || mustAnswerFirst || atQuestionLimit}
                onClick={nextQuestion}
              >
                Next question
              </Button>
              <Button size="small" variant="outlined" disabled={busy} onClick={completeInterview}>
                Complete &amp; score
              </Button>
            </Stack>
            <Box sx={{ mt: { xs: 2, sm: 0 } }}>
              <Typography variant="caption" color="text.secondary">
                Time elapsed
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: "monospace" }}>
                {formatElapsed(seconds)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      {thread.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Transcript
          </Typography>
          {thread.map((t) => (
            <Box key={t.id} sx={{ py: 1.5 }}>
              <Typography variant="caption" fontWeight={600}>
                Q{t.order + 1}
              </Typography>
              <MarkdownContent>{t.text}</MarkdownContent>
              {t.response && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  You: {t.response.answer}
                </Typography>
              )}
              <Divider sx={{ mt: 1.5 }} />
            </Box>
          ))}
        </Box>
      )}

      {currentQuestion && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Answer current question
          </Typography>
          <Box sx={{ my: 1 }}>
            <MarkdownContent>{currentQuestion.text}</MarkdownContent>
          </Box>
          <Box component="form" onSubmit={submitAnswer}>
            <TextField
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              fullWidth
              multiline
              minRows={4}
              sx={{ mb: 1 }}
            />
            <Button type="submit" size="small" variant="contained" color="secondary" disabled={busy}>
              Submit answer
            </Button>
          </Box>
        </Paper>
      )}

      {result && (
        <AiPanel title="Evaluation" loading={false} error={null}>
          <Typography variant="body2" fontWeight={600}>
            Score: {result.score}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <MarkdownContent>{result.feedback}</MarkdownContent>
          </Box>
        </AiPanel>
      )}
    </Box>
  );
}

function TabEnglish() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");

  async function onSend(e) {
    e.preventDefault();
    setError("");
    setContent("");
    setLoading(true);
    try {
      const data = await api.english({ text });
      setContent(data.content || "");
    } catch (ex) {
      setError(ex.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Paste professional English you want feedback on.
      </Typography>
      <Box component="form" onSubmit={onSend}>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          fullWidth
          multiline
          minRows={6}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          Send
        </Button>
      </Box>
      <AiPanel title="Gemini — English coaching" loading={loading} error={error}>
        {content && <MarkdownContent>{content}</MarkdownContent>}
      </AiPanel>
    </Box>
  );
}
