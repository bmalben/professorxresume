import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box, Link } from "@mui/material";

/**
 * Renders Gemini markdown as styled HTML (headings, lists, code, tables, links).
 */
export default function MarkdownContent({ children }) {
  const text = typeof children === "string" ? children : "";
  if (!text.trim()) return null;

  return (
    <Box
      className="gemini-markdown"
      sx={{
        typography: "body2",
        color: "text.primary",
        "& > :first-of-type": { mt: 0 },
        "& > :last-child": { mb: 0 },
        "& p": { mt: 0, mb: 1.5, lineHeight: 1.7 },
        "& h1": { typography: "h5", fontWeight: 600, mt: 2.5, mb: 1 },
        "& h2": { typography: "h6", fontWeight: 600, mt: 2, mb: 1 },
        "& h3": { typography: "subtitle1", fontWeight: 600, mt: 1.5, mb: 0.75 },
        "& h4, & h5, & h6": { typography: "subtitle2", fontWeight: 600, mt: 1.25, mb: 0.5 },
        "& ul, & ol": { pl: 2.5, my: 1, "& li": { mb: 0.5 } },
        "& li > p": { mb: 0.5 },
        "& code": {
          fontFamily: "ui-monospace, monospace",
          fontSize: "0.85em",
          bgcolor: "action.hover",
          px: 0.5,
          py: 0.125,
          borderRadius: 0.5,
        },
        "& pre": {
          bgcolor: "grey.100",
          p: 1.5,
          borderRadius: 1,
          overflow: "auto",
          my: 1.5,
          "& code": { bgcolor: "transparent", p: 0, fontSize: "0.8em" },
        },
        "& blockquote": {
          borderLeft: 4,
          borderColor: "divider",
          pl: 2,
          ml: 0,
          my: 1.5,
          color: "text.secondary",
          fontStyle: "italic",
        },
        "& hr": { border: 0, borderTop: 1, borderColor: "divider", my: 2 },
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
          my: 1.5,
          fontSize: "0.875rem",
        },
        "& th, & td": {
          border: 1,
          borderColor: "divider",
          px: 1,
          py: 0.75,
          textAlign: "left",
        },
        "& th": { bgcolor: "grey.100", fontWeight: 600 },
        "& a": { color: "primary.main" },
        "& img": { maxWidth: "100%", height: "auto", borderRadius: 1, my: 1 },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: c }) => (
            <Link component="a" href={href || "#"} target="_blank" rel="noopener noreferrer" underline="hover">
              {c}
            </Link>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
}
