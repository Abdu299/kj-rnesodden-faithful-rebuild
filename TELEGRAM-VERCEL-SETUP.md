# Telegram orders on Vercel

The order form sends a POST request to `/api/send`. The Vercel serverless function then sends the order to Telegram. The bot token is never exposed in the browser.

## 1. Create or use a Telegram bot

1. Open `@BotFather` in Telegram.
2. Create a bot with `/newbot` if you do not already have one.
3. Copy the bot token.

## 2. Get the chat ID

1. Send a message to your bot first.
2. Open this address in a browser, replacing `BOT_TOKEN`:
   `https://api.telegram.org/botBOT_TOKEN/getUpdates`
3. Find `chat.id` in the response and copy it.

For a group, add the bot to the group, send a message in the group, then use `getUpdates`. Group chat IDs commonly begin with `-`.

## 3. Add variables in Vercel

In Vercel, open:

`Project → Settings → Environment Variables`

Add:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Enable them for Production, Preview, and Development as needed, then redeploy.

## 4. Test

Submit an order on the deployed website. You should receive a Telegram message containing the customer's name, phone, delivery address, order type, selected place, description, and Norwegian timestamp.

Never commit the real bot token to GitHub or place it in frontend code.
