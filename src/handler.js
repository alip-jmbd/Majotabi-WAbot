import util from 'util';
import chalk from 'chalk';
import { plugins } from './lib/loader.js';
import config from './config.js';

const groupMetadataCache = new Map();

export async function handler(conn, m) {
    if (!m.message) return;
    try {
        const { serialize } = await import(`./lib/serialize.js?v=${Date.now()}`);
        m = serialize(m, conn);

        if (m.isBaileys) return;
        if (!m.body || typeof m.body !== 'string') return;

        const logTag = m.fromMe ? chalk.magenta.bold(`[SEND]`) : chalk.cyan.bold(`[RECV]`);
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour12: false, timeZone: 'Asia/Jakarta' });
        let groupName = '';
        if (m.isGroup) {
            let groupMeta = groupMetadataCache.get(m.chat);
            if (!groupMeta) {
                try {
                    groupMeta = await conn.groupMetadata(m.chat);
                    groupMetadataCache.set(m.chat, groupMeta);
                } catch (e) { /* ignore */ }
            }
            if (groupMeta) groupName = groupMeta.subject;
        }
        
        console.log(
            logTag, chalk.white(timeNow), chalk.yellow.bold(m.body),
            m.fromMe ? chalk.green('to') : chalk.green('from'),
            chalk.white.bold(m.fromMe ? m.chat.split('@')[0] : m.pushName),
            m.isGroup ? chalk.magenta(' in ') + chalk.white.bold(groupName) : ''
        );
        if (!m.fromMe) {
            console.log('  ' + chalk.dim(`├─› User: ${chalk.white(m.sender)}`));
            console.log('  ' + chalk.dim(`└─› Type: ${chalk.white(m.isGroup ? 'GC' : 'PC')}`));
        }
        
        const isCmd = /^[!\.]/.test(m.body);
        if (!isCmd) return;

        const prefix = m.body.charAt(0);
        const command = m.body.slice(prefix.length).trim().split(' ').shift().toLowerCase();
        const args = m.body.trim().split(/ +/).slice(1);
        const text = args.join(" ");
        const isOwner = m.fromMe || config.ownerNumber.some(owner => m.sender.startsWith(owner.trim()));
        const ownerJid = config.ownerNumber[0].includes('@') ? config.ownerNumber[0] : config.ownerNumber[0] + '@s.whatsapp.net';
        
        const setBotLabel = async (jid, label) => {
            return await conn.relayMessage(jid, { protocolMessage: { type: 30, memberLabel: { label: label, labelTimestamp: Math.floor(Date.now() / 1000) } } }, {});
        };

        const reply = async (teks, opts = {}) => {
            const defaultAdReply = {
                title: config.ownerName, body: config.botName, thumbnailUrl: config.subThumbnail,
                sourceUrl: config.siteUrl, mediaType: 1, renderLargerThumbnail: false
            };
            
            let contextInfo = {
                mentionedJid: opts.mentions,
                externalAdReply: opts.contextInfo?.externalAdReply || defaultAdReply
            };
            
            if (m.expiration > 0) contextInfo.expiration = m.expiration;

            return conn.sendMessage(m.chat, { text: teks, contextInfo }, { quoted: m });
        };
        m.reply = reply;
        
        const matchedPlugin = Array.from(plugins.values()).find(p => p.cmd && p.cmd.includes(command));
        if (matchedPlugin) {
            if (matchedPlugin.tags.includes('owner') && !isOwner) return m.reply('Perintah ini khusus Owner Bot.');
            if (!config.public && !isOwner) return;
            await matchedPlugin.run({ conn, m, args, text, command, config, plugins, isOwner, reply, setBotLabel });
        }

    } catch (e) {
        console.error(chalk.red.bold('\n[ERROR]'), chalk.red('An error occurred in handler:'));
        console.error(chalk.white.dim(util.format(e) + '\n'));
        const ownerJid = config.ownerNumber[0].includes('@') ? config.ownerNumber[0] : config.ownerNumber[0] + '@s.whatsapp.net';
        const errorMessage = `An error occurred while executing *${m.body}*:\n\n` + '```' + util.format(e) + '```';
        conn.sendMessage(ownerJid, { text: errorMessage });
    }
}