import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
export const siteData = pgTable('site_data', {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
