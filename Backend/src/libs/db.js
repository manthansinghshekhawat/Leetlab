import { PrismaClinet } from "../generated/prisma/index.js";

const globalForPrisma = globalThis;

export const db = globalForPrisma || new PrismaClinet();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
