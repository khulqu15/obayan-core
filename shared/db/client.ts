import fs from "node:fs"
import path from "node:path"
import BetterSqlite3 from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "../schema"

type SqliteClient = InstanceType<typeof BetterSqlite3>;

const dataDir = path.resolve(process.cwd(), "data")
fs.mkdirSync(dataDir, { recursive: true })

const sqliteFile = path.join(dataDir, "app.sqlite")

export const sqlite: SqliteClient = new BetterSqlite3(sqliteFile)
sqlite.pragma("journal_mode = WAL")
sqlite.pragma("foreign_keys = ON")

export const db = drizzle({ client: sqlite, schema })