import { checkPremium } from '../../lib/database.js';
import fetch from 'node-fetch';

export default {
    cmd: ['hneko'],
    tags: ['nsfw'],
    run: async ({ conn, m, isOwner }) => {
        const isPrem = checkPremium(m.sender);
        if (!isPrem && !isOwner) {
             return m.reply('*Akses Ditolak!* 🚫\n\nFitur ini khusus User Premium.\nSilahkan hubungi Owner untuk upgrade.');
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: "🍁", key: m.key } });

            const url = 'https://api.nefyu.my.id/api/waifu-nsfw/neko';
            const response = await fetch(url);
            
            if (!response.ok) throw new Error('Gagal mengambil gambar');
            
            const buffer = Buffer.from(await response.arrayBuffer());

            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `*Random Neko Nsfw*\n> _${url}_`,
                contextInfo: {
                    expiration: m.expiration > 0 ? m.expiration : undefined
                }
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await m.reply('Terjadi kesalahan saat mengambil gambar.');
        } finally {
            await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
        }
    }
};