import { addPremium } from '../../lib/database.js';

export default {
    cmd: ['addprem', 'addpremium'],
    tags: ['owner'],
    run: async ({ conn, m, args }) => {
        let user;
        let durationStr;

        if (m.quoted) {
            user = m.quoted.sender;
            durationStr = args[0];
        } 
        else if (args.length >= 2) {
            const cleanNum = args[0].replace(/[^0-9]/g, '');
            if (!cleanNum) return m.reply('Nomor tidak valid.');
            user = cleanNum + '@s.whatsapp.net';
            durationStr = args[1];
        }

        if (!user || !durationStr) {
            return m.reply(`*Format Salah!* 🚫\n\nCara pakai:\n1. Reply chat user lalu ketik *!addprem 30d*\n2. Ketik manual *!addprem 628xxx 30d*`);
        }

        const match = durationStr.match(/^(\d+)(s|m|h|d)$/);
        if (!match) {
            return m.reply('Durasi tidak valid. Gunakan format angka + s/m/h/d (Contoh: 30d, 1h).');
        }

        const value = parseInt(match[1]);
        const unit = match[2];
        const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
        const durationMs = value * multipliers[unit];

        const expireTime = addPremium(user, durationMs);
        
        const dateOptions = { 
            timeZone: 'Asia/Jakarta', 
            year: 'numeric', 
            month: 'numeric', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        };
        const dateStr = new Date(expireTime).toLocaleString('id-ID', dateOptions);

        await m.reply(`*Sukses!* ✅\n\n👤 ID: \`${user}\`\n💎 Status: *Premium*\n⏳ Berakhir: *${dateStr} WIB*`);

        try {
            await conn.sendMessage(user, { text: `*Selamat!* 🎉\n\nAnda telah menjadi user *PREMIUM*.\nNikmati fitur eksklusif bot ini.\n\n⏳ Masa aktif berakhir pada:\n*${dateStr} WIB*` });
        } catch (e) {}
    }
};