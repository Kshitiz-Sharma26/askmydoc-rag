import { configDotenv } from "dotenv";
configDotenv();
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const getQueryTool = () => {
    return sql;
}

export default getQueryTool;
