import { fetchWaifu } from '../../lib/waifu.js';

export default {
    cmd: ['waifu-v2'],
    tags: ['waifu'],
    run: async ({ conn, m }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: "🌸", key: m.key } });
            const buffer = await fetchWaifu('waifu-v2');
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: '*Random Waifu-v2*\n> _https://api.nefyu.my.id/api/waifu-sfw/waifu-v2_',
                contextInfo: { expiration: m.expiration > 0 ? m.expiration : undefined }
            }, { quoted: m });
        } catch (e) {
            console.error(e);
            await m.reply('Error.');
        } finally {
            await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
        }
    }
};