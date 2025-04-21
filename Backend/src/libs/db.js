// import { PrismaClinet } from "../generated/prisma/index.js";

import pkg from "../generated/prisma/index.js";
const { PrismaClient } = pkg;

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
