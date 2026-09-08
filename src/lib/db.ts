// Prisma Client tekil örneği — dev modda hot-reload'da birden fazla
// bağlantı açılmasını önlemek için global'e cache'lenir.
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
