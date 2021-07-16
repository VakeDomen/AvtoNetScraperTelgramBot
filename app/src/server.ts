import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { onStart } from './controllers/start.controller';
import { onHelp } from './controllers/help.controller';
import { Filter } from './controllers/scraper/filter.scraper';
import getUrls = require('get-urls');
import * as fetch from 'node-fetch';
import cheerio = require('cheerio');
const fs = require('fs');

let bot: Telegraf;
let filter: Filter = new Filter();
let deals: any = {}
let timer = false;
let last = new Date();

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
    const links = fs.readFileSync('data.txt', {encoding:'utf8', flag:'r'}).split(',');
    const ids = links.map((link: string) => link.substr(40, 8));
    console.log(links, ids)
    for (let i = 0 ; i < links.length ; i++) {
        if (!deals[ids[i]]) {
            deals[ids[i]] = links[i];
        }
    }
    console.log(deals)
}

async function scrape(ctx, silent?: boolean) {
    console.log('scpraping')
    
    const url = Array.from(
        getUrls('https://www.avto.net/Ads/results.asp?znamka=&model=&modelID=&tip=&znamka2=&model2=&tip2=&znamka3=&model3=&tip3=&cenaMin=0&cenaMax=3500&letnikMin=2011&letnikMax=2090&bencin=0&starost2=999&oblika=&ccmMin=0&ccmMax=99999&mocMin=&mocMax=&kmMin=0&kmMax=150000&kwMin=0&kwMax=999&motortakt=&motorvalji=&lokacija=0&sirina=&dolzina=&dolzinaMIN=&dolzinaMAX=&nosilnostMIN=&nosilnostMAX=&lezisc=&presek=&premer=&col=&vijakov=&EToznaka=&vozilo=&airbag=&barva=&barvaint=&EQ1=1000000000&EQ2=1000000000&EQ3=1000000000&EQ4=100000000&EQ5=1000000000&EQ6=1000000000&EQ7=1000100020&EQ8=1010000001&EQ9=1000000000&KAT=1010000000&PIA=&PIAzero=&PSLO=&akcija=&paketgarancije=0&broker=&prikazkategorije=&kategorija=&ONLvid=&ONLnak=&zaloga=10&arhiv=&presort=&tipsort=&stran=')
    ).pop();
    let options: any = {};
    options.redirect = "follow";
    options.follow = 20;
    options.headers = {
        "method":"GET",
        "path":"/catalog/classlist?k=math&t=2177&e=all&hon=F&promod=F",
        "scheme":"https",
        "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "accept-encoding":"gzip, deflate, sdch, br",
        "accept-language":"en-US,en;q=0.8",
        "cache-control":"no-cache",
        "cookie":"JSESSIONID=javaprod19~413DF4150236B1466C8ECB85EB796C06.catalog19; onlineCampusSelection=C; __cfduid=d5e9cb96f2485f7500fec2116ee8f23381491087061; __utma=59190898.1874896314.1491088625.1491088625.1491088625.1; __utmb=59190898.2.10.1491088625; __utmc=59190898; __utmz=59190898.1491088625.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=137925942.2000995260.1491087063.1491087063.1491088718.2; __utmb=137925942.2.10.1491088718; __utmc=137925942; __utmz=137925942.1491088718.2.2.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); ADRUM=s=1491089349546&r=https%3A%2F%2Fwebapp4.asu.edu%2Fcatalog%2Fclasslist%3F-1275642430",
        "pragma":"no-cache",
        "referer":"https://webapp4.asu.edu/catalog/",
        "upgrade-insecure-requests":"1",
        "user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
    }
                
    const resp = await fetch(url, options);
    const html = await resp.text();
    const $ = cheerio.load(html);
    // console.log(html)
    const res = $('.stretched-link').splice(8);
    const links = res
        .map((el: any) => el['attribs']['href'])
        .map((link: string) => `https://www.avto.net${link.substring(2)}`);

    const ids = links.map((link: string) => link.substr(40, 8));
    let found = false;
    for (let i = 0 ; i < links.length ; i++) {
        if (!deals[ids[i]]) {
            deals[ids[i]] = links[i];
            ctx.reply(deals[ids[i]])
            found = true;
        }
    }
    console.log(silent)
    if (!found && !silent) {
        ctx.reply('No new deals. Type /all to see all found deals')
    }
    fs.writeFileSync('data.txt', links.toString());
    last = new Date();
}

function initBot(): void {
    console.log("Setting up bot...");
    bot = new Telegraf(process.env.BOT_TOKEN || '');
    bot.start(onStart);
    bot.command('scrape', (ctx) => scrape(ctx));
    bot.command('help', onHelp);
    bot.command('all', allDeals);
    bot.command('timer', setTimer);
    bot.command('stop', unsetTimer);
    bot.command('last', lastScrape);
    console.log("Bot set up!");
}

async function setTimer(ctx) {
    timer = true;
    loop(ctx)
}

function lastScrape(ctx): void {
    ctx.reply(`Last scrape: ${last.toString()}`)
}

function loop(ctx) {
    if (timer) {
        scrape(ctx, true);
        last
        setTimeout(() => loop(ctx), 600000)
    }
}

function unsetTimer(ctx) {
    timer = false;
    ctx.reply('Scraping timer stopped!')
}

function allDeals(ctx) {
    for (const deal in deals) {
        ctx.reply(deals[deal]);
    }
}


function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
start();
