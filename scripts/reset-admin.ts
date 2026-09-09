// Admin sifresini sifirlar/yeni admin olusturur. Kullanim:
//   npm run admin:reset -- admin@egemtrak.com yeni-guclu-sifre
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const [email, password] = process.argv.slice(2)
  if (!email || !password) {
    console.error('Kullanim: npm run admin:reset -- <email> <yeni-sifre>')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('Sifre en az 8 karakter olmali.')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: 'Admin' },
  })

  console.log(`Sifre guncellendi: ${user.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
