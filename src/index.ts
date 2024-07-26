import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';

import { findUser, addNewUser, getAllUsers } from './db';

if (!process.env.TELEGRAM_TOKEN) {
  throw new Error('TELEGRAM_TOKEN is not provided');
}

const WEB_APP = process.env.TELEGRAM_WEB_APP_URL || 'https://example.com';

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  filepath: false,
  polling: true,
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await findUser(chatId);

  if (!user) {
    await addNewUser({
      telegramId: String(chatId),
      firstname: msg.chat.first_name,
      lastname: msg.chat.last_name,
    });
  }

  await bot.sendPhoto(
    chatId,
    fs.createReadStream(
      path.join(__dirname, '..', 'static', 'images', 'greetings.jpg')
    )
  );
  await bot.sendMessage(
    chatId,
    `<b>Welcome</b> <a href="tg://user?id=${msg.from?.id}">${msg.from?.first_name}</a>\n\nThank you for your subscription.\nClick the link below to see a small greeting message.`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Greetings! 👋',
              web_app: {
                url: `${WEB_APP}?firstname=${msg.from?.first_name}`,
              },
            },
          ],
        ],
      },
    }
  );

  await bot.sendMessage(
    chatId,
    'If you have admin privileges you can also use the following commands:\n\n/adminusers - Get all users\n/adminhello - Send a message to a user'
  );
});

bot.onText(/\/adminusers/, async (msg) => {
  const chatId = msg.chat.id;

  const user = await findUser(chatId);
  if (user?.role.name !== 'ADMIN') {
    bot.sendMessage(
      chatId,
      'Sorry, you dont have permission to run this command!'
    );
    return;
  }

  const users = await getAllUsers();
  bot.sendMessage(
    chatId,
    users.map((user) => `${user.telegramId} - ${user.role.name}`).join('\n')
  );
});
