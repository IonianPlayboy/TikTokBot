import dotenv from "dotenv";
import { Telegraf, Markup } from "telegraf";
import fetch from "node-fetch";

dotenv.config();

if (!process.env.BOT_TOKEN) {
    console.log("No token found. :c");
    process.exit();
}

const bot = new Telegraf(process.env.BOT_TOKEN);
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

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
