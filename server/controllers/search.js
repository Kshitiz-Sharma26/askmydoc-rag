import getVectorDBClient from "../database/vectordb-connection.js";
import { makeEmbeddings } from "../utils/common.js";
import { groq, getSystemPrompt } from "../utils/common.js";

const vectordbClient = getVectorDBClient();

const MAX_HISTORY_TURNS = 6; // 3 user + 3 assistant

export async function searchQuery(req, resp) {
  const { id: user_id = 1, query, history } = req.body;

  // Input validation
  if (!query?.trim()) {
    return resp.status(400).json({ message: "Query is required." });
  }

  // Safe history parsing + trimming
  let parsedHistory = [];
  try {
    parsedHistory = Array.isArray(history)
      ? history
      : JSON.parse(history ?? "[]");
    parsedHistory = parsedHistory.slice(-MAX_HISTORY_TURNS); // keep last 6 messages
  } catch {
    parsedHistory = []; // if malformed, just ignore history
  }

  try {
    // Embed the query
    const [query_embedding] = await makeEmbeddings([{ pageContent: query }]);

    // Search Qdrant
    const vectordbResponse = await vectordbClient.query("med-reports", {
      query: query_embedding,
      filter: {
        must: [{ key: "user_id", match: { value: parseInt(user_id) } }],
      },
      limit: 14,
      with_payload: true,
      score_threshold: 0.5,
    });

    const context = vectordbResponse.points
      ?.map((point) => point.payload?.content)
      ?.filter(Boolean) // remove undefined chunks
      ?.join("\n\n");

    if (!context) {
      return resp.status(200).json({
        message: "I couldn't find relevant information in your report.",
      });
    }

    // Call Groq
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: getSystemPrompt(context) },
        ...parsedHistory,
        { role: "user", content: query },
      ],
      temperature: 0.2,
    });

    const system_response = response?.choices?.[0];
    if (
      system_response?.finish_reason !== "stop" ||
      !system_response?.message?.content
    ) {
      return resp.status(503).json({
        message: "Cannot generate response, try again.",
      });
    }

    return resp.status(200).json({
      message: system_response.message.content,
    });
  } catch (err) {
    console.error("searchQuery error:", err);
    return resp.status(500).json({ message: "Internal server error." });
  }
}
