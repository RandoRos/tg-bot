export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export type User = {
  telegramId: string;
  firstname?: string;
  lastname?: string;
  role?: Role;
};