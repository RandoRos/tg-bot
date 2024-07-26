## A basic TelegramBot

This is a basic TelegramBot which is implemented using official Telegram Bot API framework for javascript [node-telegram-bot-api](https://www.npmjs.com/package/node-telegram-bot-api)

The bot is straightforward and leverages several features provided by Telegram, such as inline keyboards, external web app calls, and command lists. However, the Telegram Bot API offers a wide range of additional interactive and functional capabilities that can be integrated to further enhance this application.

### Install & Run

Before running the bot, you need to provide Telegram bot token into `.env` file under `TELEGRAM_TOKEN=[YOUR_TELEGRAM_BOT_TOKEN]`

1. Install dependenices using command `npm install`
2. Run database create and seeding `npm run migrate`
3. To start bot:
    - in **dev mode** run `npm run dev`
    - in **prod mode** run `npm run build && npm start`

