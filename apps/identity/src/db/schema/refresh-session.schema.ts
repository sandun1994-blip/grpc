import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { varchar } from "drizzle-orm/pg-core";

 export const refreshSessions = pgTable('refresh_sessions', {
   id: uuid('id').primaryKey().defaultRandom(),
   userId: uuid('user_id').notNull().references(() => users.id,{onDelete: 'cascade'}),
   tokenHash: varchar('token_hash',{length: 255}).notNull(),
   expiresAt: timestamp('expires_at',{withTimezone: true}).notNull(),
   revokedAt: timestamp('revoked_at',{withTimezone: true}),
   createdAt: timestamp('created_at',{withTimezone: true}).defaultNow().notNull(),
 });