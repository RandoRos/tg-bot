import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  })

  await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  })
}

main().then(async () => {
  await prisma.$disconnect()
})