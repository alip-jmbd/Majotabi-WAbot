import { createRequire } from 'module';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import chalk from 'chalk';
import os from 'os';
import { Writable } from 'stream';
import util from 'util';
import { loadPlugins } from './lib/loader.js';
import config from './config.js';
import { saveMessage } from './lib/database.js';
import pkg from '../package.json' with { type: 'json' };

const localTmp = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(localTmp)) fs.mkdirSync(localTmp, { recursive: true });
process.env.TMPDIR = localTmp;
os.tmpdir = () => localTmp;

const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;

function isSpam(args) {
    const msg = args.map(arg => String(arg)).join(' ').toLowerCase();
    const blacklist = [
        'bad mac', 'closing session', 'closing open session', 'prekey bundle',
        'sessionentry', 'decryption error', 'decrypt message', 'chainkey',
        'ratchet', 'chains', 'textsecure', 'libsignal', 'error: bad mac',
        'decrypted message', 'rate-overlimit', 'stream ended', 'network error'
    ];
    return blacklist.some(word => msg.includes(word));
}

console.log = (...args) => { if (!isSpam(args)) originalLog(...args); };
console.info = (...args) => { if (!isSpam(args)) originalInfo(...args); };
console.warn = (...args) => { if (!isSpam(args)) originalWarn(...args); };
console.error = (...args) => { if (!isSpam(args)) originalError(...args); };

process.on('uncaughtException', (err) => {
    if (!isSpam([err])) originalError('Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
    if (!isSpam([err])) originalError('Unhandled Rejection:', err);
});

const silentStream = new Writable({
  write(chunk, encoding, callback) { callback(); }
});

const logger = pino({ level: 'silent' }, silentStream);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const require = createRequire(import.meta.url);
const Baileys = require('@whiskeysockets/baileys');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} = Baileys;

let conn;
let isBotReady = false;
const messageCache = new Set();

function clearTmp() {
    fs.readdir(localTmp, (err, files) => {
        if (err) return;
        files.forEach(file => {
            if (/^.*\.(mp4|mp3|gif|webp|jpg|jpeg|png|m4a|aac|bin|tmp)$/i.test(file)) {
                fs.unlink(path.join(localTmp, file), () => {});
            }
        });
    });
}

console.clear();
originalLog(chalk.cyan(`
⣿⠛⠛⠛⠛⠻⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠛⢛⣿⠋⢀⡾⠃⠀⠀⠀⠀⢀⣤⣤⠤⠤⣤⣤⣀⣀⣀⣠⠶⡶⣤⣀⣠⠾⡷⣦⣀⣤⣤⡤⠤⠦⢤⣤⣄⡀⠀⢠⡶⢶⡄⠀⠀
⢠⡟⠁⣴⣿⢤⡄⣴⢶⠶⡆⠈⢷⡀⠀⠀⠀⠀⢀⣭⣫⠵⠥⠽⣄⣝⠵⢍⣘⣄⠳⣤⣀⠀⠀⢀⡤⠊⣽⠁⠀⠸⣇⠀⢿⠀⠀
⠸⢷⣴⣤⡤⠾⠇⣽⠋⠼⣷⠀⠈⢷⡄⢀⣤⡶⠋⠀⣀⡄⠤⠀⡲⡆⠀⠀⠈⠙⡄⠘⢮⢳⡴⠯⣀⢠⡏⠀⠀⠀⢻⠀⢸⠇⠀
⠀⠀⠀⠀⠀⠀⠀⠙⠛⠋⠉⢀⣴⠟⠉⢯⡞⡠⢲⠉⣼⠀⠀⡰⠁⡇⢀⢷⠀⣄⢵⠀⠈⡟⢄⠀⠀⠙⢷⣤⣤⣤⡿⢢⡿⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠟⠑⠊⠁⡼⣌⢠⢿⢸⢸⡀⢰⠁⡸⡇⡸⣸⢰⢈⠘⡄⠀⢸⠀⢣⡀⠀⠈⢮⢢⣏⣤⡾⠃⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣯⣴⠞⡠⣼⠁⡘⣾⠏⣿⢇⣳⣸⣞⣀⢱⣧⣋⣞⡜⢳⡇⠀⢸⠀⢆⢧⠀⠰⣄⢏⢧⣾⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⹀⡏⢰⠁⡻⠀⡟⡏⠉⠀⣀⠀⠀⠀⠀⣀⠁⠀⠉⠛⢽⠇⠀⣼⡆⠈⡆⠃⠀⡏⠻⣾⣽⣇⡀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠁⡇⠀⡇⡄⣿⠷⠿⠿⠛⠀⠀⠀⠀⠛⠻⠿⠿⠿⡜⢀⡴⡟⢸⣸⡼⠀⠀⡇⠀⡞⡆⢻⠙⢦⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡶⢀⣼⣿⣬⣽⠧⠬⠇⠀⠀⠀⠀⠀⠀⢞⣯⣭⢺⣔⣪⣾⣤⠺⡇⢳⠀⢠⣧⡾⠛⠛⠻⠶⠞⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠷⢿⠟⠉⡀⠈⢦⡀⠀⠀⣠⠖⠒⠒⢤⡀⠀⢀⡼⠿⢇⡣⢬⣶⠷⢿⣤⡾⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠷⠾⠷⠖⠛⠛⠲⠶⠿⠤⣤⠤⠤⢷⣶⠋⠀⠀⠀⣱⠞⠁⠀⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠓⠒⠚⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`));
originalLog(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
originalLog(chalk.cyan.bold('› [SYSTEM]'), chalk.white(`OS: ${os.platform()} (${os.arch()})`));
originalLog(chalk.magenta.bold('› [RUNTIME]'), chalk.white(`Node.js: ${process.version}`));
originalLog(chalk.blue.bold('› [BOT]'), chalk.white(`Name: ${pkg.name}`));
originalLog(chalk.green.bold('› [VERSION]'), chalk.white(`v${pkg.version}`));
originalLog(chalk.yellow.bold('› [AUTHOR]'), chalk.white(`${pkg.author}`));
originalLog(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

clearTmp();
setInterval(clearTmp, 180 * 1000);

let handlerFunc;
async function reloadHandler() {
    try {
        const handlerUrl = `./handler.js?update=${Date.now()}`;
        const newModule = await import(handlerUrl);
        handlerFunc = newModule.handler;
        originalLog(chalk.yellow.bold('› [UPDATE]'), chalk.white('Handler reloaded successfully'));
    } catch (e) {
        originalError(chalk.red.bold('› [HANDLER]'), chalk.red('Error reloading handler'), e);
    }
}

const filesToWatch = ['./src/handler.js'];
const libDir = './src/lib';

if (fs.existsSync(libDir)) {
    fs.readdirSync(libDir).forEach(file => {
        if (file.endsWith('.js')) {
            filesToWatch.push(path.join(libDir, file));
        }
    });
}

filesToWatch.forEach(file => {
    fs.watch(file, async (event) => {
        if (event === 'change') {
            if (file.includes('handler.js')) {
                await reloadHandler();
            } else {
                originalLog(chalk.cyan.bold('› [LIB]'), chalk.white(`Library updated: ${path.basename(file)}`));
                await reloadHandler(); 
            }
        }
    });
});

async function startBot() {
    const ownerJid = config.ownerNumber[0] + '@s.whatsapp.net';
    await reloadHandler();
    await loadPlugins(ownerJid, conn);

    const { state, saveCreds } = await useMultiFileAuthState(`session/${config.sessionName}`);
    const { version } = await fetchLatestBaileysVersion();

    conn = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        browser: config.browser,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000, 
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        retryRequestDelayMs: 2000,
        getMessage: async (key) => (undefined)
    });

    if (!conn.authState.creds.me && !conn.authState.creds.registered) {
        originalLog(chalk.yellow.bold('› [AUTH]'), chalk.white('No session found. Please pair a new device.'));
        originalLog(chalk.dim('› Please enter your WhatsApp number (e.g., 628...):'));
        
        const phoneNumber = await question('');
        
        try {
            originalLog(chalk.cyan.bold('› [PAIRING]'), chalk.white('Requesting pairing code...'));
            await sleep(2000);
            const code = await conn.requestPairingCode(phoneNumber.trim());
            originalLog(chalk.cyan.bold('› [CODE]'), chalk.bgGreen.black(` ${code} `));
            originalLog(chalk.dim('› Please enter this code on WhatsApp > Linked Devices > Link with Phone Number.\n'));
        } catch (err) {
            originalError(chalk.red.bold('› [ERROR]'), chalk.red('Failed to request pairing code. Please check the number.'), err);
            rl.close();
        }
    }

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            isBotReady = false;
            const statusCode = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                originalLog(chalk.yellow.bold('› [RECONNECT]'), chalk.white('Connection lost. Reconnecting...'));
                startBot();
            } else {
                originalLog(chalk.red.bgBlack('› [FATAL] Could not reconnect (Logged Out). Please delete the session folder and restart.'));
            }
        } else if (connection === 'open') {
            originalLog(chalk.green.bold('› [SUCCESS]'), chalk.white('Connection established successfully.'));
            isBotReady = true;
            originalLog(chalk.blue.bold('› [READY]'), chalk.white('Bot is now ready to process messages! ☘️'));
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        if (!isBotReady) return;

        try {
            if (chatUpdate.type !== 'notify' || !chatUpdate.messages || !chatUpdate.messages.length) return;
            const m = chatUpdate.messages[0];
            
            if (m.key && m.key.remoteJid === 'status@broadcast') return;
            if (!m.message) return;

            if (messageCache.has(m.key.id)) return;
            messageCache.add(m.key.id);
            setTimeout(() => messageCache.delete(m.key.id), 5000);

            saveMessage(m);
            if (handlerFunc) handlerFunc(conn, m);
        } catch (err) {
            if (!isSpam([err])) {
                originalError('Error in messages.upsert:', err);
            }
        }
    });
}

startBot();