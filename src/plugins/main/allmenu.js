import os from 'os';

export default {
    cmd: ['allmenu', 'all'],
    tags: ['main'],
    run: async ({ conn, m, plugins, config }) => {
        const categoryMap = {};
        
        for (let [name, plugin] of plugins) {
            if (plugin.tags && plugin.tags.length > 0 && plugin.cmd) {
                const tag = plugin.tags[0];
                const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
                if (!categoryMap[capitalizedTag]) categoryMap[capitalizedTag] = [];
                plugin.cmd.forEach(cmd => categoryMap[capitalizedTag].push(cmd));
            }
        }

        const date = new Date();
        const hour = parseInt(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta", hour: "numeric", hour12: false }));
        let greeting = "Konbanwa";
        let emoji = "🌙";
        if (hour >= 0 && hour < 11) { greeting = "Ohayouu"; emoji = "🌅"; }
        else if (hour >= 11 && hour < 15) { greeting = "Konnichiwa"; emoji = "☀️"; }
        else if (hour >= 15 && hour < 18) { greeting = "Konnichiwa"; emoji = "🌥️"; }

        let fullMenu = "";
        const sortedCategories = Object.keys(categoryMap).sort();

        sortedCategories.forEach(tag => {
            fullMenu += `\n\`📁 ${tag}\`\n`;
            const cmds = categoryMap[tag].sort();
            cmds.forEach((cmd, index) => {
                const isLast = index === cmds.length - 1;
                fullMenu += `${isLast ? '└──' : '├──'} !${cmd}\n`;
            });
        });

        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const text = `*${greeting},* @${m.sender.split('@')[0]} ${emoji}
_Watashi wa ${config.botName.split(' - ')[0]} !_
Berikut adalah *SEMUA* menu ku !
${fullMenu}
> _か | ${config.botName} by ${config.ownerName} ☘️_`;

        await conn.sendMessage(m.chat, {
            text: text,
            contextInfo: {
                externalAdReply: {
                    title: `Uptime: ${uptimeStr}`,
                    body: `${plugins.size} Plugins Loaded`,
                    thumbnailUrl: config.thumbnail,
                    sourceUrl: 'https://wa.me/' + config.ownerNumber,
                    mediaType: 1,
                    renderLargerThumbnail: true
                },
                mentionedJid: [m.sender]
            }
        }, { quoted: m });
    }
};
