import { readFileSync, writeFileSync } from "fs";
const { Telegraf } = require("telegraf");
import puppeteer from 'puppeteer';

let bot: any;
let deals: any = {}
let timer = false;
let scraping = false;
let last = new Date();
let url = null;

function checkEnv(): void {
    console.log("Checking credentials...");
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
    const links = readFileSync('data.txt', { encoding: 'utf8', flag: 'r' }).split(',') ?? [];
    const ids = links.map((link: string) => link.substr(40, 8));
    for (let i = 0; i < links.length; i++) {
        if (!deals[ids[i]]) {
            deals[ids[i]] = links[i];
        }
    }
}

async function scrape(ctx, silent?: boolean) {
    console.log('scpraping')

    if (!url) {
        ctx.reply("No filter url set. Provide a filter url with /setfilter <https://avto.net/Ads...>")
        return
    }
    if (scraping) {
        ctx.reply("Currently scraping...wait a minute...")
        return
    }


    (async () => {
        scraping = true;
        try {

            // Launch Puppeteer in headless mode
            const browser = await puppeteer.launch({
                headless: true,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            // Set custom headers
            await page.setExtraHTTPHeaders({
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "accept-encoding": "gzip, deflate, sdch, br",
                "accept-language": "en-US,en;q=0.8",
                "cache-control": "no-cache",
                "cookie": "JSESSIONID=javaprod19~413DF4150236B1466C8ECB85EB796C06.catalog19; onlineCampusSelection=C; __cfduid=d5e9cb96f2485f7500fec2116ee8f23381491087061; __utma=59190898.1874896314.1491088625.1491088625.1491088625.1; __utmb=59190898.2.10.1491088625; __utmc=59190898; __utmz=59190898.1491088625.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=137925942.2000995260.1491087063.1491087063.1491088718.2; __utmb=137925942.2.10.1491088718; __utmc=137925942; __utmz=137925942.1491088718.2.2.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); ADRUM=s=1491089349546&r=https%3A%2F%2Fwebapp4.asu.edu%2Fcatalog%2Fclasslist%3F-1275642430",
                "pragma": "no-cache",
                "referer": "https://webapp4.asu.edu/catalog/",
                "upgrade-insecure-requests": "1",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
            });
    
            // Navigate to the URL
            await page.goto(url, {
                waitUntil: 'networkidle2'
            });
    
            // Wait for the challenge to complete by checking for an element that appears only after the challenge
            await page.waitForSelector('.stretched-link', { timeout: 60000 });
    
            // Get the page content
            const html = await page.content();
    
            // Use Cheerio to parse the HTML
            const cheerio = require('cheerio');
            const $ = cheerio.load(html);
    
            // Example: Print out the page title
            console.log(html)
            const res = $('.stretched-link').splice(8);
            const links = res
                .map((el: any) => el['attribs']['href'])
                .map((link: string) => `https://www.avto.net${link.substring(2)}`);
    
            const ids = links.map((link: string) => link.substr(40, 8));
            let found = false;
            for (let i = 0; i < links.length; i++) {
                if (!deals[ids[i]]) {
                    deals[ids[i]] = links[i];
                    ctx.reply(`New offer: ${deals[ids[i]]}`)
                    found = true;
                }
            }
            console.log(silent)
            if (!found && !silent) {
                ctx.reply('No new deals. Type /all to see all found deals')
            }
            writeFileSync('data.txt', links.toString());
            last = new Date();
            // Close Puppeteer
            await browser.close();
            scraping = false
        } catch (e) {
            ctx.reply("Something went wrong scraping...check server logs")
            console.error(e)
            scraping = false
        }
    })();


}

function initBot(): void {
    console.log("Setting up bot...");
    bot = new Telegraf(process.env.BOT_TOKEN || '');
    bot.command('scrape', (ctx) => scrape(ctx));
    bot.command('all', (ctx) => allDeals(ctx));
    bot.command('start', (ctx) => setTimer(ctx));
    bot.command('stop', (ctx) => unsetTimer(ctx));
    bot.command('last', (ctx) => lastScrape(ctx));
    bot.command('status', (ctx) => status(ctx))
    bot.command('setfilter', (ctx) => setFilter(ctx))
    bot.command('getfilter', (ctx) => getFilter(ctx))
    bot.command('help', (ctx) => help(ctx))

    console.log("Bot set up!");
}

function help(ctx) {

    ctx.reply(`
/scrape - manually scrape current filter
/status - status of the bot
/all - all found deals (careful...spamm)
/start - start the automated scrape timer
/stop - stop the automated scrape timer
/setfilter - Provide a filter url with /setfilter <https://avto.net/Ads...>
/last - time of the last scrape
    `)
}

function setFilter(ctx) {
    try {
        url = ctx["update"]["message"]["text"].split(" ")[1];
        if (!url) {
            ctx.reply("Couldn't parse url filter. Provide a filter url with /setfilter <https://avto.net/Ads...>")
        }
    } catch (e) {
        ctx.reply("Something went wrong... make sure you only paste the link.")
    }
}


function getFilter(ctx) {
    ctx.reply("Current filter: \n" + url);
}

async function setTimer(ctx) {
    if (timer) {
        ctx.reply(`Already running`)
        return
    }
    timer = true;
    loop(ctx)
}

function lastScrape(ctx): void {
    ctx.reply(`Last scrape: ${last.toString()}`)
}

function loop(ctx) {
    if (timer) {
        scrape(ctx, true);
        setTimeout(() => loop(ctx), 600000)
    }
}

function unsetTimer(ctx) {
    if (!timer) {
        ctx.reply(`Not running...`)
        return
    }
    timer = false;
    ctx.reply('Scraping timer stopped!')
}

function status(ctx) {
    let resp = "";
    if (timer) resp += `🔴 Not running...`;
    else resp += "🟢 Running...";
    resp += "\n";
    resp += `Last scrape: ${last.toString()}`
    ctx.reply(resp)
}

function allDeals(ctx) {
    if (!deals) {
        ctx.reply("Sorry...no offers yet..")
        return
    }
    ctx.reply("Current found deals:")
    for (const deal in deals) {

        ctx.reply(deals[deal]);
    }
}

start();
