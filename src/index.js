import { createRequire } from 'module';
import pino from 'pino';
import fs from 'fs';
import readline from 'readline';
import chalk from 'chalk';
import os from 'os';
import { loadPlugins } from './lib/loader.js';
import config from './config.js';
import { saveMessage, loadMessage } from './lib/database.js';

const require = createRequire(import.meta.url);
const Baileys = require('@whiskeysockets/baileys');

const makeWASocket = Baileys.default || Baileys.makeWASocket || Baileys;
const useMultiFileAuthState = Baileys.useMultiFileAuthState || Baileys.default?.useMultiFileAuthState;
const DisconnectReason = Baileys.DisconnectReason || Baileys.default?.DisconnectReason;
const makeCacheableSignalKeyStore = Baileys.makeCacheableSignalKeyStore || Baileys.default?.makeCacheableSignalKeyStore;
const fetchLatestBaileysVersion = Baileys.fetchLatestBaileysVersion || Baileys.default?.fetchLatestBaileysVersion;

const originalLog = console.log;
console.log = (...args) => {
    if (args[0] && typeof args[0] === 'string' && (args[0].includes('Closing session') || args[0].includes('Removing old closed session'))) return;
    originalLog.apply(console, args);
};

const logger = pino({ level: 'silent' });
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.clear();
console.log(chalk.cyan(`
⣿⠛⠛⠛⠛⠻⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠛⢛⣿⠋⢀⡾⠃⠀⠀⠀⠀⢀⣤⣤⠤⠤⣤⣤⣀⣀⣀⣠⠶⡶⣤⣀⣠⠾⡷⣦⣀⣤⣤⡤⠤⠦⢤⣤⣄⡀⠀⢠⡶⢶⡄⠀⠀
⢠⡟⠁⣴⣿⢤⡄⣴⢶⠶⡆⠈⢷⡀⠀⠀⠀⠀⢀⣭⣫⠵⠥⠽⣄⣝⠵⢍⣘⣄⠳⣤⣀⠀⠀⢀⡤⠊⣽⠁⠀⠸⣇⠀⢿⠀⠀
⠸⢷⣴⣤⡤⠾⠇⣽⠋⠼⣷⠀⠈⢷⡄⢀⣤⡶⠋⠀⣀⡄⠤⠀⡲⡆⠀⠀⠈⠙⡄⠘⢮⢳⡴⠯⣀⢠⡏⠀⠀⠀⢻⠀⢸⠇⠀
⠀⠀⠀⠀⠀⠀⠀⠙⠛⠋⠉⢀⣴⠟⠉⢯⡞⡠⢲⠉⣼⠀⠀⡰⠁⡇⢀⢷⠀⣄⢵⠀⠈⡟⢄⠀⠀⠙⢷⣤⣤⣤⡿⢢⡿⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠟⠑⠊⠁⡼⣌⢠⢿⢸⢸⡀⢰⠁⡸⡇⡸⣸⢰⢈⠘⡄⠀⢸⠀⢣⡀⠀⠈⢮⢢⣏⣤⡾⠃⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣯⣴⠞⡠⣼⠁⡘⣾⠏⣿⢇⣳⣸⣞⣀⢱⣧⣋⣞⡜⢳⡇⠀⢸⠀⢆⢧⠀⠰⣄⢏⢧⣾⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢹⡏⢰⠁⡻⠀⡟⡏⠉⠀⣀⠀⠀⠀⠀⣀⠁⠀⠉⠛⢽⠇⠀⣼⡆⠈⡆⠃⠀⡏⠻⣾⣽⣇⡀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠁⡇⠀⡇⡄⣿⠷⠿⠿⠛⠀⠀⠀⠀⠛⠻⠿⠿⠿⡜⢀⡴⡟⢸⣸⡼⠀⠀⡇⠀⡞⡆⢻⠙⢦⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡶⢀⣼⣿⣬⣽⠧⠬⠇⠀⠀⠀⠀⠀⠀⢞⣯⣭⢺⣔⣪⣾⣤⠺⡇⢳⠀⢠⣧⡾⠛⠛⠻⠶⠞⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠷⢿⠟⠉⡀⠈⢦⡀⠀⠀⣠⠖⠒⠒⢤⡀⠀⢀⡼⠿⢇⡣⢬⣶⠷⢿⣤⡾⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠷⠾⠷⠖⠛⠛⠲⠶⠿⠤⣤⠤⠤⢷⣶⠋⠀⠀⠀⣱⠞⠁⠀⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠓⠒⠚⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`));
console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
console.log(chalk.blue(`System : ${os.platform()} - ${os.arch()}`));
console.log(chalk.blue(`NodeJS : ${process.version}`));
console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

let handlerFunc;
async function reloadHandler() {
    try {
        const handlerUrl = `./handler.js?update=${Date.now()}`;
        const newModule = await import(handlerUrl);
        handlerFunc = newModule.handler;
    } catch (e) {
        console.error(chalk.red('Error reloading handler'), e);
    }
}

const watchFiles = ['./src/handler.js', './src/lib/serialize.js'];
watchFiles.forEach(file => {
    fs.watch(file, (event) => {
        if (event === 'change') reloadHandler();
    });
});

async function startBot() {
    await reloadHandler();
    await loadPlugins();

    const { state, saveCreds } = await useMultiFileAuthState(`session/${config.sessionName}`);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
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
        retryRequestDelayMs: 2000, 
        transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
        defaultQueryTimeoutMs: undefined,
        getMessage: async (key) => {
            const msg = loadMessage(key.id);
            return msg ? msg.message : { conversation: 'Hello' };
        }
    });

    if (!conn.authState.creds.me && !conn.authState.creds.registered) {
        console.log(chalk.yellow('⚠️ Belum terhubung ke WhatsApp!'));
        console.log(chalk.dim('Silahkan masukkan nomor dibawah ini...'));
        
        console.log(chalk.green('\nMasukkan Nomor WhatsApp (Cth: 628xxx): '));
        const phoneNumber = await question(''); 
        
        try {
            const code = await conn.requestPairingCode(phoneNumber.trim());
            console.log(chalk.bold.white('\nKode Pairing Anda:'));
            console.log(chalk.bgGreen.black(` ${code} `));
            console.log(chalk.dim('Salin kode di atas dan masukkan ke WhatsApp > Perangkat Tertaut > Tautkan dengan No HP\n'));
        } catch (err) {
            console.error(chalk.red('Gagal meminta pairing code. Pastikan nomor benar.'));
        }
    }

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red('❌ Koneksi terputus. Menghubungkan ulang...'));
            if (shouldReconnect) {
                await sleep(3000);
                startBot();
            }
        } else if (connection === 'open') {
            console.log(chalk.cyan('Menstabilkan koneksi... (3s)'));
            await sleep(3000); 
            console.log(chalk.green.bold('\n✅ Majotabi Connected to Server 🚀'));
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            if (!chatUpdate.messages || chatUpdate.messages.length === 0) return;
            const m = chatUpdate.messages[0];
            
            saveMessage(m);

            if (!m.message) return;
            if (handlerFunc) handlerFunc(conn, m);
        } catch (err) {
            console.error(err);
        }
    });
}

startBot();
