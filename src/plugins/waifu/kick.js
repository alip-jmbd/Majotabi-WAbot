import { fetchWaifu } from '../../lib/waifu.js';

export default {
    cmd: ['kick'],
    tags: ['waifu'],
    run: async ({ conn, m }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: "🌸", key: m.key } });
            const buffer = await fetchWaifu('kick');
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: '*Random Kick*\n> _https://api.nefyu.my.id/api/waifu-sfw/kick_',
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