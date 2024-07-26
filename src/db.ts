import { type User, Role } from './types';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export const findUser = async (id: number) => {
  return await db.user.findUnique({
    where: {
      telegramId: String(id),
    },
    select: {
      role: true,
      firstname: true,
      lastname: true,
      telegramId: true,
    },
  });
};

export const addNewUser = async (user: User) => {
  return await db.user.create({
    data: {
      telegramId: user.telegramId,
      firstname: user.firstname || '',
      lastname: user.lastname,
      role: { connect: { name: Role.USER } },
    },
  });
};

export const getAllUsers = async () => {
  return await db.user.findMany({
    select: { role: true, telegramId: true, firstname: true },
  });
};
