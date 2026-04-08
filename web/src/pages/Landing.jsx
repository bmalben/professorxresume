import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InterviewIcon from "@mui/icons-material/RecordVoiceOver";
import LanguageIcon from "@mui/icons-material/Language";

const imgHero =
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80";
const imgJob =
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80";
const imgMock =
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80";
const imgEnglish =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80";

const features = [
  {
    title: "Job role intelligence",
    text: "Understand the role, core skills, and likely interview themes — generated for your target position.",
    image: imgJob,
    icon: <AutoAwesomeIcon color="primary" />,
  },
  {
    title: "Resume-aware mock interviews",
    text: "Text-based practice with questions from Gemini grounded in your role and resume. Track progress and time.",
    image: imgMock,
    icon: <InterviewIcon color="primary" />,
  },
  {
    title: "English for work",
    text: "Polish professional phrasing, corrections, and rewrites in a dedicated coaching flow.",
    image: imgEnglish,
    icon: <LanguageIcon color="primary" />,
  },
];

export default function Landing() {
  return (
    <Box component="article">
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1, maxWidth: { md: "48%" } }}>
              <Typography variant="overline" sx={{ opacity: 0.9 }}>
                AI interview platform
              </Typography>
              <Typography variant="h3" component="h1" sx={{ mt: 1, mb: 2, fontWeight: 600 }}>
                Practice interviews that feel real
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.92, lineHeight: 1.7 }}>
                Professor X combines job intelligence, mock Q&amp;A powered by Google Gemini, and English
                coaching — minimal UI, maximum clarity on what the AI is doing for you.
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="inherit"
                  sx={{ color: "primary.main", fontWeight: 600 }}
                >
                  Get started
                </Button>
                <Button component={RouterLink} to="/login" variant="outlined" color="inherit">
                  Log in
                </Button>
              </Stack>
            </Box>
            <Box
              sx={{
                flex: 1,
                width: "100%",
                maxWidth: { md: "50%" },
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 6,
                lineHeight: 0,
              }}
            >
              <Box
                component="img"
                src={imgHero}
                alt="Team collaborating in a modern office"
                sx={{ width: "100%", height: "auto", display: "block", verticalAlign: "bottom" }}
              />
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          What you can do
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ maxWidth: 560, mx: "auto", mb: 5 }}
        >
          Three focused tools in one place. Your API key stays on the server; you see clear, labeled AI
          output.
        </Typography>

        <Stack spacing={4}>
          {features.map((f) => (
            <Card key={f.title} variant="outlined" sx={{ overflow: "visible" }}>
              <Stack direction={{ xs: "column", sm: "row" }}>
                <CardMedia
                  component="img"
                  image={f.image}
                  alt=""
                  sx={{
                    width: { xs: "100%", sm: 280 },
                    height: { xs: 200, sm: "auto" },
                    objectFit: "cover",
                  }}
                />
                <CardContent sx={{ flex: 1, py: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    {f.icon}
                    <Typography variant="h6" component="h3">
                      {f.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {f.text}
                  </Typography>
                </CardContent>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Container>

      <Box sx={{ bgcolor: "grey.100", py: 6 }}>
        <Container maxWidth="sm">
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
            Ready when you are
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Create a free account to save sessions and see progress on your dashboard.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
            <Button component={RouterLink} to="/register" variant="contained" size="large">
              Register
            </Button>
            <Button component={RouterLink} to="/login" variant="outlined" size="large">
              Log in
            </Button>
          </Stack>
        </Container>
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ py: 2 }}>
        Showcase photos from Unsplash (various photographers).
      </Typography>
    </Box>
  );
}
