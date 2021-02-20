import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';

let bot: Telegraf;

function checkEnv(): void {
    console.log("Checking credentials...");
    dotenv.config();
    if (!process.env.BOT_TOKEN) {
        console.log("Bot token not specified!");
        process.exit(1);
    }
    console.log("Crednetials checked!");
}

function start(): void {
    checkEnv();
    initBot();
    console.log("Launching bot...");
    bot.launch();
    console.log("Done!");
}

function initBot(): void {
    console.log("Setting up bot...");
    bot = new Telegraf(process.env.BOT_TOKEN || '');
    // bot.start(startCallback);
    // bot.command('price', priceCallback);
    // bot.command('balance', balanceCallback);
    // bot.command('stonks', tradeValueCallback);
    // bot.command('last', lastTradeCallback);
    // bot.command('btc', btcValueCallback);
    // bot.command('eth', ethValueCallback);
    console.log("Bot set up!");
}

start();
