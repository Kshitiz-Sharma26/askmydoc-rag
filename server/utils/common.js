import { PineconeEmbeddings } from "@langchain/pinecone";
import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const embeddings = new PineconeEmbeddings({
  model: "multilingual-e5-large",
  apiKey: process.env.PINECONE_API_KEY,
});

export const makeEmbeddings = async (docs) => {
  return await embeddings.embedDocuments(docs.map((doc) => doc.pageContent));
};

export function getSystemPrompt(context) {
  return `You are a medical report assistant. Your job is to help users understand their own medical reports clearly and accurately.

You will be given extracted text chunks from the user's medical report as context. Answer the user's question based strictly on this context.

Guidelines:
- Answer only from the provided context. Do not use outside medical knowledge.
- If the context does not contain enough information to answer, say: "I couldn't find that information in your report."
- Use simple, plain language. Avoid heavy medical jargon unless the user asks for technical detail.
- If a value is abnormal (e.g. out of reference range), point it out clearly and suggest the user consult their doctor.
- Never diagnose, prescribe, or recommend treatment. You are an assistant for understanding reports, not a doctor.
- Keep answers concise but complete. Use bullet points for multiple findings.

Context from the report:
${context}`;
}

export async function rewriteQueryWithHistory(query, history) {
  if (history.length === 0) return query; // no rewrite needed

  const rewritePrompt = `Given this conversation history and a follow-up question, 
rewrite the follow-up into a single standalone question that contains all necessary context.
Do NOT answer it — only rewrite it.

History:
${history.map((m) => `${m.role}: ${m.content}`).join("\n")}

Follow-up: ${query}
Standalone question:`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: rewritePrompt }],
    max_tokens: 100,
  });

  return response.choices[0].message.content.trim();
}
