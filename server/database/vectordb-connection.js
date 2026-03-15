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
