# Telegram orders on Vercel

The order form sends a POST request to `/api/send`. The server verifies the Nesodden address, calculates the delivery fee and menu total, checks restaurant hours, then sends the order to Telegram. The bot token is never exposed in the browser.

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

The rebuilt site uses the existing variable names, so configured production values can be reused. Do not send the token in chat, commit it, or add a `VITE_` prefix. For local development, copy `.env.example` to `.env` and fill in the server variables.

The project uses Node.js 24, `npm ci` and `npm run build`. Its Nitro preset is `vercel`; `vercel.json` sets the installation and build commands. The original repository's `bun.lock` remains for the connected Lovable editor, while Vercel uses `package-lock.json`.

`ORDER_ALLOWED_ORIGINS` is optional and accepts comma-separated origins for another browser frontend you control. The deployed site's own origin and native app requests are allowed without it.

## 4. Test

First run `npm test`, `npm run typecheck` and `npm run build`. The automated tests mock Telegram and send no actual messages.

For a live check, use a dedicated test bot/chat with the owner's permission. Select an open restaurant, choose a real Nesodden suggestion and check the delivery fee, items, toppings and total. Submit once and verify that the Telegram message and receipt have matching totals and the same reference. Do not place an accidental real restaurant order.

Also check an address outside Nesodden produces no suggestion, editing the selected address removes the fee, and closed restaurants cannot be submitted. A missing bot configuration or Telegram error must keep the cart and show an error; the site must never show a success receipt in those cases.

For Noe annet, O' Sole Mio and Mama Greek Kitchen, Telegram receives an inquiry with a known delivery fee and an explicitly unconfirmed goods price. Confirm availability and the final total with the customer before purchasing.

Never commit the real bot token to GitHub or place it in frontend code.
