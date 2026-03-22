import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";
import getQueryTool from "../database/db-connection.js";
import readPDF from "../utils/pdfreader.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import getVectorDBClient from "../database/vectordb-connection.js";
import { makeEmbeddings } from "../utils/common.js";

const queryTool = getQueryTool();
const vectordbClient = getVectorDBClient();

export async function uploadFile(req, resp) {
  try {
    req.body.id = 1;
    const text = await readPDF(req.file.path);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500, // characters per chunk
      chunkOverlap: 50, // overlap between chunks for context continuity
    });

    const docs = await splitter.createDocuments([text]);
    // Make embeddings from documents created from PDF content
    const query_embeddings = await makeEmbeddings(docs);
    console.log("Made");

    const created_file =
      await queryTool`INSERT INTO "File"(name, user_id) VALUES(${req.file.originalname}, ${req.body.id}) RETURNING *`;
    console.log(created_file);
    const upload_file_id = created_file[0].id;

    const vector_payload = query_embeddings.map((vector, ind) => {
      return {
        id: uuidv4(),
        vector,
        payload: {
          user_id: req.body.id,
          file_id: upload_file_id,
          content: docs[ind].pageContent,
        },
      };
    });

    const operationInfo = await vectordbClient.upsert("med-reports", {
      wait: true,
      points: vector_payload,
    });
    console.log("operationInfo", operationInfo);

    await fs.unlink(req.file.path);
  } catch (err) {
    console.log(err);
    return resp.status(503).json({
      message: "Error while pdf parsing.",
    });
  }
  return resp.status(200).json({
    message: "File recieved",
  });
}

export async function deleteFile(req, resp) {
  const userId = parseInt(req.body.id); // or +req.user.id
  const fileId = parseInt(req.params.id); // or +req.params.fileId
  console.log(userId, fileId);

  const deletionResp =
    await queryTool`DELETE FROM "File" WHERE id=${fileId} and user_id = ${userId} RETURNING *`;

  console.log("Deletion response: ", deletionResp);

  const vectordbResponse = await vectordbClient.delete("med-reports", {
    filter: {
      must: [
        { key: "user_id", match: { value: userId } },
        { key: "file_id", match: { value: fileId } },
      ],
    },
  });

  console.log("Vector db response:", vectordbResponse);
  return resp.status(200).json({
    message: "File deleted",
  });
}
