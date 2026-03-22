import { QdrantClient } from "@qdrant/js-client-rest";
import { configDotenv } from "dotenv";
configDotenv();

const URL = process.env.QDRANT_URL;
const API_KEY = process.env.QDRANT_API_KEY;

const client = new QdrantClient({
  url: URL,
  apiKey: API_KEY,
});

const getVectorDBClient = () => {
  return client;
};

export default getVectorDBClient;

/**
 * Command used to create vectordb collection
 * await vectordbClient.createCollection("med-reports", {
 * vectors: { size: 1024, distance: "Cosine" },
});
*/

/**
 * Command used for making indexes on vectors
 *  await vectordbClient.createPayloadIndex("med-reports", {
      field_name: "user_id",
      field_schema: "integer",
    });
    console.log(r1);

    await vectordbClient.createPayloadIndex("med-reports", {
      field_name: "file_id",
      field_schema: "integer",
    });
 */