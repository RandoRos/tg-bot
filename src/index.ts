import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';

import { findUser, addNewUser, getAllUsers } from './db';

const commands: TelegramBot.BotCommand[] = [
  { command: 'start', description: 'Start the bot' },
  { command: 'adminusers', description: 'Get all users' },
  { command: 'adminhello', description: 'Send a message to a user' },
];

if (!process.env.TELEGRAM_TOKEN) {
  throw new Error('TELEGRAM_TOKEN is not provided');
}

const WEB_APP = process.env.TELEGRAM_WEB_APP_URL || 'https://example.com';

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  filepath: false,
  polling: true,
});

console.log('Bot polling is started...');

bot.setMyCommands(commands);

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
          [
            {
              text: '📋 Show Admin commands',
              callback_data: 'help',
            },
          ],
        ],
      },
    }
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
    users
      .map(
        (user) => `${user.telegramId} - ${user.firstname} (${user.role.name})`
      )
      .join('\n')
  );
});

bot.onText(/\/adminhello (\d+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  const user = await findUser(chatId);
  if (user?.role.name !== 'ADMIN') {
    bot.sendMessage(
      chatId,
      'Sorry, you dont have permission to run this command!'
    );
    return;
  }

  const targetUserId = Number(match && match[1]);
  const text = match && match[2];

  if (!targetUserId) {
    bot.sendMessage(chatId, 'Command is missing telegram user id');
    return;
  }

  if (!text) {
    bot.sendMessage(chatId, 'Command is missing text');
    return;
  }

  bot.sendMessage(targetUserId, text).catch((err) => {
    console.error(`ERROR: ${err.message}`);
    bot.sendMessage(chatId, 'User not found');
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id || 0;
  switch (query.data) {
    case 'help':
      bot.sendMessage(
        chatId,
        'List of Admin commands:\n\n/adminusers - Get all users\n/adminhello [userId] [message] - Send a message to a user',
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Close ❌',
                  callback_data: 'close',
                },
              ],
            ],
          },
        }
      );
      break;
    case 'close':
      bot.deleteMessage(chatId, query.message?.message_id || 0);
      break;
    default:
      break;
  }
});
