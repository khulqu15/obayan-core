import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../schema/index";
import { appDB } from "./database";

export const db = drizzle(appDB.connectionString, { schema });