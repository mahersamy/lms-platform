import type { Config } from 'drizzle-kit';

export default {
  dialect: 'postgresql',
  // Each feature owns its schema files inside its own infrastructure/ folder.
  // This glob collects all of them without coupling drizzle to any one feature.
  schema: './libs/features/**/*.schema.ts',
  out: './tools/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
} satisfies Config;
