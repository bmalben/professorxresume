import { Box, CircularProgress, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

export default function AiPanel({ title = "AI output", loading, error, children }) {
  const theme = useTheme();
  const border = alpha(theme.palette.primary.main, 0.35);
  const bg = alpha(theme.palette.primary.main, 0.06);

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        border: `1px solid ${border}`,
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        borderRadius: 1,
        bgcolor: bg,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "primary.main",
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
        {loading && <CircularProgress size={18} />}
      </Box>
      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 0 }}>
          {error}
        </Typography>
      )}
      {!loading && !error && children}
    </Box>
  );
}
