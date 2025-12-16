import os from 'os';

export default {
    cmd: ['menu', 'help'],
    tags: ['main'],
    run: async ({ conn, m, plugins, config, text }) => {
        const date = new Date();
        const hour = parseInt(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta", hour: "numeric", hour12: false }));
        let greeting = "Konbanwa";
        let emoji = "🌙";
        if (hour >= 0 && hour < 11) { greeting = "Ohayouu"; emoji = "🌅"; }
        else if (hour >= 11 && hour < 15) { greeting = "Konnichiwa"; emoji = "☀️"; }
        else if (hour >= 15 && hour < 18) { greeting = "Konnichiwa"; emoji = "🌥️"; }

        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        if (!text) {
            const categoryMap = {};
            for (let [name, plugin] of plugins) {
                if (plugin.tags && plugin.tags.length > 0) {
                    const tag = plugin.tags[0];
                    const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
                    if (!categoryMap[capitalizedTag]) categoryMap[capitalizedTag] = [];
                }
            }
            const categoryList = Object.keys(categoryMap).sort();
            let menuTree = "";
            categoryList.forEach((cat, index) => {
                const isLast = index === categoryList.length - 1;
                menuTree += `${isLast ? '└──' : '├──'} ${cat}\n`;
            });

            const mainText = `*${greeting},* @${m.sender.split('@')[0]} ${emoji}
_Watashi wa ${config.botName.split(' - ')[0]} !_
Berikut adalah semua kategori *MENU* ku ! 

\`📁 Feature\`
${menuTree}
Ketik *!allmenu* untuk melihat semua.

> _か | ${config.botName} by ${config.ownerName} ☘️_`;

            await conn.sendMessage(m.chat, {
                text: mainText,
                contextInfo: {
                    externalAdReply: {
                        title: `Uptime: ${uptimeStr}`,
                        body: `Mode: ${config.public ? 'Public' : 'Self'}`,
                        thumbnailUrl: config.thumbnail,
                        sourceUrl: 'https://wa.me/' + config.ownerNumber,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    },
                    mentionedJid: [m.sender]
                }
            }, { quoted: m });

        } else {
            const targetTag = text.toLowerCase();
            const commands = [];
            
            for (let [name, plugin] of plugins) {
                if (plugin.tags && plugin.tags.includes(targetTag) && plugin.cmd) {
                    plugin.cmd.forEach(c => commands.push(c));
                }
            }

            if (commands.length === 0) {
                return m.reply(`Kategori *${text}* tidak ditemukan atau kosong.`);
            }

            let cmdTree = "";
            commands.sort().forEach((c, index) => {
                const isLast = index === commands.length - 1;
                cmdTree += `${isLast ? '└──' : '├──'} !${c}\n`;
            });

            const catName = targetTag.charAt(0).toUpperCase() + targetTag.slice(1);
            const subMenuText = `*${greeting},* @${m.sender.split('@')[0]} ${emoji}
_Watashi wa ${config.botName.split(' - ')[0]} !_

Berikut adalah menu *${catName.toUpperCase()}* !

📁 ${catName}
${cmdTree}
> _か | ${config.botName} by ${config.ownerName} ☘️_`;

            await conn.sendMessage(m.chat, {
                text: subMenuText,
                contextInfo: {
                    externalAdReply: {
                        title: `Category: ${catName}`,
                        body: `Total: ${commands.length} Commands`,
                        thumbnailUrl: config.thumbnail,
                        sourceUrl: 'https://wa.me/' + config.ownerNumber,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    },
                    mentionedJid: [m.sender]
                }
            }, { quoted: m });
        }
    }
};
