import { Injectable } from '@nestjs/common';
import { db } from '../db/client';
import { eq, and, isNull } from 'drizzle-orm';
import { refreshSessions } from '../db/schema';

@Injectable()
export class RefreshSessionsRepository {
  async create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    const [session] = await db.insert(refreshSessions).values(data).returning();
    return session;
  }

  async findByTokenHash(tokenHash: string) {
    return db.query.refreshSessions.findFirst({
      where: and(
        eq(refreshSessions.tokenHash, tokenHash),
        isNull(refreshSessions.revokedAt),
      ),
    });
  }

  revoke(id: string) {
    return db
      .update(refreshSessions)
      .set({ revokedAt: new Date() })
      .where(eq(refreshSessions.id, id));
  }

  revokeByTokenHash(tokenHash: string) {
    return db
      .update(refreshSessions)
      .set({ revokedAt: new Date() })
      .where(eq(refreshSessions.tokenHash, tokenHash));
  }
}
