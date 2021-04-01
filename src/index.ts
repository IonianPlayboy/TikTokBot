import dotenv from "dotenv";
import express from "express";
import { Telegraf, Markup } from "telegraf";
import fetch from "node-fetch";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || "https://tiktok-preview-bot.herokuapp.com/";

const expressApp = express();

const bot = new Telegraf(BOT_TOKEN);
bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`);
expressApp.use(bot.webhookCallback(`/bot${BOT_TOKEN}`));

bot.start((ctx) => ctx.reply("Welcome"));

bot.on("text", async (ctx) => {
    const currText = ctx.message.text;
    if (!/https:\/\/vm\.tiktok.+/.test(currText)) return;
    const url = (await fetch(currText)).url.replace(/[?].+/, "");
    const data = await fetch(
        `https://www.tiktok.com/oembed?url=${url}`
    ).then((res) => res.json());
    const keyboard = Markup.inlineKeyboard([
        Markup.button.url("Voir la vidéo", url),
        Markup.button.callback("Delete", "delete"),
    ]);

    ctx.telegram.sendPhoto(ctx.message.chat.id, data.thumbnail_url, {
        caption: `*${data.author_name}*
		${data.title}`,
        parse_mode: "Markdown",
        ...keyboard,
    });
});
bot.action("delete", async (ctx) => {
    ctx.deleteMessage();
});

expressApp.get("/", (req, res) => {
    res.send("Hello World!");
});
expressApp.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
