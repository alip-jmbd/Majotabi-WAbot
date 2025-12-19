export default {
    cmd: ['menu', 'help'],
    tags: ['main'],
    run: async ({ m, plugins, config, text }) => {
        const start = performance.now();

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

        const botName = config.botName.split(' - ')[0];
        const more = String.fromCharCode(8206).repeat(4001);

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
                menuTree += `${isLast ? '└─' : '├─'} › ${cat}\n`;
            });

            const end = performance.now();
            const latency = (end - start).toFixed(3);

            const mainText = `*${greeting},* @${m.sender.split('@')[0]}-sama ${emoji}

> _[ 🗓️${formattedDate} - 🕓${time} WIB ]_
> _[ ⏳${uptimeStr} - ⚡${latency}ms ]_

_Watashi wa *${botName}*_, WhatsApp bot by ${config.ownerName}.
Berikut adalah semua kategori _\`Menu\`_ ku !

\`📁 Feature\`
${menuTree}
💡Ketik *!menu [kategori]* untuk melihat menu spesifik.
🍀Contoh: *!menu main*
🍄Ketik *!allmenu* untuk melihat semua perintah.

> _${config.botName} by ${config.ownerName} ☘️_`;

            await m.reply(mainText, {
                mentions: [m.sender],
                contextInfo: {
                    expiration: m.expiration,
                    externalAdReply: {
                        title: `Uptime: ${uptimeStr}`,
                        body: `Mode: ${config.public ? 'Public' : 'Self'}`,
                        thumbnailUrl: config.thumbnail,
                        sourceUrl: config.siteUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });

        } else {
            const targetTag = text.toLowerCase();
            const commands = new Set();
            
            for (let [name, plugin] of plugins) {
                if (plugin.tags && plugin.tags.includes(targetTag) && plugin.cmd) {
                    commands.add(plugin.cmd[0]);
                }
            }
            
            const commandArray = Array.from(commands).sort();

            if (commandArray.length === 0) {
                return m.reply(`Kategori *${text}* tidak ditemukan atau kosong.`);
            }

            let cmdTree = "";
            commandArray.forEach((c, index) => {
                const isLast = index === commandArray.length - 1;
                cmdTree += `${isLast ? '└─' : '├─'} › !${c}\n`;
            });

            const end = performance.now();
            const latency = (end - start).toFixed(3);
            const catName = targetTag.charAt(0).toUpperCase() + targetTag.slice(1);
            
            const isLong = commandArray.length > 10;

            const subMenuText = `*${greeting},* @${m.sender.split('@')[0]}-sama ${emoji}

> _[ 🗓️${formattedDate} - 🕓${time} WIB ]_
> _[ ⏳${uptimeStr} - ⚡${latency}ms ]_

_Watashi wa *${botName}*_, WhatsApp bot by ${config.ownerName}.
Berikut adalah menu _\`${catName}\`_ !
────────────────
${isLong ? more : ''}
\`📁 ${catName}\`
${cmdTree}
> _${config.botName} by ${config.ownerName} ☘️_`;

            await m.reply(subMenuText, { 
                mentions: [m.sender],
                contextInfo: {
                    expiration: m.expiration,
                    externalAdReply: {
                        title: `Kategori: ${catName}`,
                        body: `Mode: ${config.public ? 'Public' : 'Self'}`,
                        thumbnailUrl: config.thumbnail, 
                        sourceUrl: config.siteUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true 
                    }
                }
            });
        }
    }
};