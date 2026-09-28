import { Injectable } from "@nestjs/common";
import { db } from "../db/client";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class UsersRepository {
    findByEmail(email: string) {
        return db.query.users.findFirst({
            where: eq(users.email, email),
        })
    }

    findByUsername(username: string) {
        return db.query.users.findFirst({
            where: eq(users.username, username),
        })
    }

    findById(id: string) {
        return db.query.users.findFirst({
            where: eq(users.id, id),
        })
    }

    async create(data: Omit<RegisterDto, "password"> & { passwordHash: string }) { 
        const { passwordHash, ...rest } = data;
        const [user] = await db
            .insert(users)
            .values({ ...rest, password: passwordHash })
            .returning();
        return user;
    }
}