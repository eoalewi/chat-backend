import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function resetDb() {
  await prisma.messageReceipt.deleteMany();
  await prisma.message.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
}
