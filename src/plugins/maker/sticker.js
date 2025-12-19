import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import StickerFormatter from 'wa-sticker-formatter';

const streamToBuffer = async (stream) => {
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
};

export default {
    cmd: ['s', 'sticker'],
    tags: ['maker'],
    run: async ({ conn, m, config }) => {
        let q = m.quoted ? m.quoted : m;
        let msg = q.msg || q;
        let mime = (msg.mimetype || '').split(';')[0]; 

        if (!mime) {
            return m.reply('Kirim/Reply gambar atau video dengan perintah .s');
        }

        try {
            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

            let mediaType = mime.split('/')[0]; 
            let downloadType = mediaType; 

            if (q.mtype === 'viewOnceMessageV2' || q.mtype === 'viewOnceMessage') {
                msg = q.message[Object.keys(q.message)[0]]; 
                downloadType = Object.keys(q.message)[0].replace('Message', '');
            } else if (q.mtype === 'videoMessage') {
                downloadType = 'video';
            } else if (q.mtype === 'imageMessage') {
                downloadType = 'image';
            } else if (q.mtype === 'stickerMessage') {
                downloadType = 'sticker';
            } else {
                downloadType = mediaType;
            }

            const stream = await downloadContentFromMessage(msg, downloadType);
            let mediaBuffer = await streamToBuffer(stream);

            if (mediaBuffer.length > 10 * 1024 * 1024) {
                return m.reply('File terlalu besar. Maksimal 10MB.');
            }

            const Sticker = StickerFormatter.default || StickerFormatter;
            
            const sticker = new Sticker(mediaBuffer, {
                pack: config.botName.split(' - ')[0],
                author: config.ownerName,
                type: mediaType === 'video' ? 'full' : 'crop',
                quality: 40, 
                background: 'transparent'
            });

            const buffer = await sticker.toBuffer();

            await conn.sendMessage(m.chat, { 
                sticker: buffer,
                contextInfo: {
                    expiration: m.expiration > 0 ? m.expiration : undefined
                }
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await m.reply('Gagal membuat stiker.');
        } finally {
            await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
        }
    }
};