import { SQLDatabase } from "encore.dev/storage/sqldb";

export const appDB = new SQLDatabase("app", {
    migrations: {
        path: "migrations",
        source: "drizzle",
    },
});