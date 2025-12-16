import { plugins } from './lib/loader.js';
import config from './config.js';
import { exec } from 'child_process';
import util from 'util';
import chalk from 'chalk';

export async function handler(conn, m) {
    if (!m.message) return;
    try {
        const { serialize } = await import(`./lib/serialize.js?v=${Date.now()}`);
        m = serialize(m, conn);
        
        if (!m.body || typeof m.body !== 'string') return;
        
        const prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(m.body) ? m.body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : '';
        const isCmd = m.body.startsWith(prefix);
        const command = isCmd ? m.body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = m.body.trim().split(/ +/).slice(1);
        const text = args.join(" ");
        const isOwner = m.sender.split('@')[0] === config.ownerNumber || m.fromMe;
        
        const q = m.quoted ? m.quoted : null;

        const isBotResponse = m.fromMe && m.isBaileys;

        if (!isBotResponse) {
            const msgTimestamp = m.messageTimestamp || Math.floor(Date.now() / 1000);
            const latency = (Date.now() / 1000) - msgTimestamp;
            const timeNow = new Date().toLocaleTimeString('id-ID', { hour12: false });
            const chatType = m.isGroup ? '👥 Group' : '👤 Private';

            console.log(chalk.dim('╭──────────────────────────────────────────────────────╮'));
            console.log(`│ ${chalk.bold.green('👤 Name    :')} ${chalk.white(m.pushName || 'Unknown')}`);
            console.log(`│ ${chalk.bold.blue('📱 JID     :')} ${chalk.cyan(m.sender.split('@')[0])} ${chalk.dim(`(${chatType})`)}`);
            console.log(`│ ${chalk.bold.yellow('⏰ Time    :')} ${chalk.white(timeNow)}`);
            console.log(`│ ${chalk.bold.magenta('💌 Message :')} ${chalk.white(m.body.length > 50 ? m.body.substring(0, 50) + '...' : m.body)}`);
            console.log(`│ ${chalk.bold.red('⚡ Latency :')} ${chalk.green(latency.toFixed(3) + ' s')}`);
            console.log(chalk.dim('╰──────────────────────────────────────────────────────╯'));
        }

        const setBotLabel = async (jid, label) => {
            const payload = {
                protocolMessage: {
                    type: 30, 
                    memberLabel: {
                        label: label,
                        labelTimestamp: Math.floor(Date.now() / 1000)
                    }
                }
            };
            return await conn.relayMessage(jid, payload, {});
        };

        const reply = async (teks, opts = {}) => {
            return await conn.sendMessage(m.chat, {
                text: teks,
                contextInfo: {
                    externalAdReply: {
                        title: config.ownerName, 
                        body: config.botName,
                        thumbnailUrl: config.subThumbnail,
                        sourceUrl: config.siteUrl,
                        mediaType: 1,
                        renderLargerThumbnail: false 
                    },
                    mentionedJid: opts.mentions || [],
                    ...opts.contextInfo
                }
            }, { quoted: m, ...opts });
        };

        m.reply = reply;

        if (isOwner) {
            if (m.body.startsWith('>')) {
                try {
                    let evaled = await eval(m.body.slice(1));
                    if (typeof evaled !== 'string') evaled = util.inspect(evaled);
                    await conn.sendMessage(m.chat, { text: evaled }, { quoted: m });
                } catch (e) {
                    await conn.sendMessage(m.chat, { text: util.format(e) }, { quoted: m });
                }
                return;
            }

            if (m.body.startsWith('$')) {
                exec(m.body.slice(1), (err, stdout, stderr) => {
                    if (err) return conn.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
                    if (stderr) return conn.sendMessage(m.chat, { text: stderr }, { quoted: m });
                    if (stdout) return conn.sendMessage(m.chat, { text: stdout }, { quoted: m });
                });
                return;
            }
        }

        if (isCmd) {
            if (!config.public && !isOwner) return;

            for (let [name, plugin] of plugins) {
                if (plugin.cmd && plugin.cmd.includes(command)) {
                    await plugin.run({ conn, m, args, text, config, plugins, isOwner, reply, setBotLabel });
                    return; 
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}
