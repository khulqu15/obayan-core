import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './shared/schema/index.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: './data/app.sqlite',
    },
    verbose: true,
    strict: true,
});