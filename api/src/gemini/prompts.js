export function jobIntelPrompt(jobRole, jobDescription) {
  const desc = jobDescription?.trim() || "No additional description provided.";
  return `You are a career coach. For the job role "${jobRole}" and this context:\n${desc}\n\nProduce a clear, structured answer with these sections (use markdown headings):\n## What this job entails\n## Core components and skills\n## Likely interview themes\nKeep it concise and practical.`;
}

export function mockInterviewQuestionPrompt({ jobRole, resumeText, history }) {
  const resume = resumeText?.trim() || "(No resume text — ask general role-fit questions.)";
  let convo = "";
  if (history?.length) {
    convo = history
      .map((h) => `Q: ${h.question}\nA: ${h.answer || "(not answered yet)"}`)
      .join("\n\n");
  }
  return `You are an interviewer for the role: "${jobRole}".

Candidate resume (excerpt; may be truncated):
---
${resume.slice(0, 12000)}
---

Prior exchange:
${convo || "(Start of interview — this is the first question.)"}

Ask exactly ONE next interview question. Be specific to their background when possible. Do not repeat a question already asked. Output ONLY the question text, no preamble or numbering.`;
}

export function englishCoachPrompt(userText) {
  return `You help non-native speakers improve professional English. The user wrote:

"""
${userText.slice(0, 8000)}
"""

Give: (1) a brief assessment, (2) corrected or improved rewrite, (3) 2–3 concrete tips. Use markdown with short headings.`;
}

export function interviewEvaluationPrompt({ jobRole, qaPairs }) {
  const body = qaPairs.map((p, i) => `Q${i + 1}: ${p.q}\nA${i + 1}: ${p.a}`).join("\n\n");
  return `You evaluate a mock text interview for "${jobRole}".

Transcript:
${body}

Respond with valid JSON only, no markdown fence:
{"score": <number 0-100>, "feedback": "<2-4 sentences on communication, accuracy, confidence>"}`;
}
