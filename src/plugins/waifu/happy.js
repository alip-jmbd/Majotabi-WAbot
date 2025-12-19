import { fetchWaifu } from '../../lib/waifu.js';

export default {
    cmd: ['happy'],
    tags: ['waifu'],
    run: async ({ conn, m }) => {
        try {
            await conn.sendMessage(m.chat, { react: { text: "🌸", key: m.key } });
            const buffer = await fetchWaifu('happy');
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: '*Random Happy*\n> _https://api.nefyu.my.id/api/waifu-sfw/happy_',
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