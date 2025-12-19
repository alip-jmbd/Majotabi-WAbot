export default {
    cmd: ['allmenu'],
    tags: ['main'],
    run: async ({ conn, m, plugins, config }) => {
        const start = performance.now();

        const categoryMap = {};
        
        for (let [name, plugin] of plugins) {
            if (plugin.tags && plugin.tags.length > 0 && plugin.cmd && plugin.cmd.length > 0) {
                const tag = plugin.tags[0];
                const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
                if (!categoryMap[capitalizedTag]) {
                    categoryMap[capitalizedTag] = new Set();
                }
                categoryMap[capitalizedTag].add(plugin.cmd[0]);
            }
        }

        const date = new Date();
        const localeStringOptions = { timeZone: "Asia/Jakarta" };
        
        const day = date.toLocaleDateString("id-ID", { ...localeStringOptions, day: '2-digit' });
        const month = date.toLocaleDateString("id-ID", { ...localeStringOptions, month: 'short' });
        const year = date.toLocaleDateString("id-ID", { ...localeStringOptions, year: 'numeric' });
        const time = date.toLocaleTimeString("id-ID", { ...localeStringOptions, hour: '2-digit', minute: '2-digit' });
        const formattedDate = `${day} ${month} ${year}`;

        const hour = parseInt(date.toLocaleString("en-US", { ...localeStringOptions, hour: "numeric", hour12: false }));
        let greeting = "Konbanwa";
        let emoji = "🌙";
        if (hour >= 4 && hour < 11) { greeting = "Ohayou"; emoji = "🌅"; }
        else if (hour >= 11 && hour < 15) { greeting = "Konnichiwa"; emoji = "☀️"; }
        else if (hour >= 15 && hour < 18) { greeting = "Konnichiwa"; emoji = "⛅"; }

        const uptimeSeconds = process.uptime();
        const d = Math.floor(uptimeSeconds / (3600 * 24));
        const h = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const min = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeStr = `${d}d ${h}h ${min}m`;

        let fullMenu = "";
        const sortedCategories = Object.keys(categoryMap).sort();

        sortedCategories.forEach(tag => {
            fullMenu += `\n\`📁 ${tag}\`\n`;
            const cmds = Array.from(categoryMap[tag]).sort();
            cmds.forEach((cmd, index) => {
                const isLast = index === cmds.length - 1;
                fullMenu += `${isLast ? '└─' : '├─'} › !${cmd}\n`;
            });
        });

        const end = performance.now();
        const latency = (end - start).toFixed(3);
        const botName = config.botName.split(' - ')[0];
        const more = String.fromCharCode(8206).repeat(4001);

        const text = `*${greeting},* @${m.sender.split('@')[0]}-sama ${emoji}

> _[ 🗓️${formattedDate} - 🕓${time} WIB ]_
> _[ ⏳${uptimeStr} - ⚡${latency}ms ]_

_Watashi wa *${botName}*_, WhatsApp bot by ${config.ownerName}.
Berikut adalah _\`SEMUA\`_ menu ku !
────────────────
${more}
${fullMenu}

> _${config.botName} by ${config.ownerName} ☘️_`;
        
        await m.reply(text, { 
            mentions: [m.sender],
            contextInfo: {
                expiration: m.expiration,
                externalAdReply: {
                    title: `Total: ${plugins.size} Perintah`,
                    body: `Mode: ${config.public ? 'Public' : 'Self'}`,
                    thumbnailUrl: config.thumbnail, 
                    sourceUrl: config.siteUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true 
                }
            }
        });
    }
};