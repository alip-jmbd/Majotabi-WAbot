import { delPremium } from '../../lib/database.js';

export default {
    cmd: ['delprem', 'delpremium'],
    tags: ['owner'],
    run: async ({ conn, m, args }) => {
        let user;

        if (m.quoted) {
            user = m.quoted.sender;
        } 
        else if (args.length > 0) {
            const cleanNum = args[0].replace(/[^0-9]/g, '');
            if (!cleanNum) return m.reply('Nomor tidak valid.');
            user = cleanNum + '@s.whatsapp.net';
        }

        if (!user) {
            return m.reply(`*Format Salah!* 🚫\n\nCara pakai:\n1. Reply chat user lalu ketik *!delprem*\n2. Ketik manual *!delprem 628xxx*`);
        }

        delPremium(user);

        await m.reply(`*Sukses!* 🗑️\n\n👤 ID: \`${user}\`\n❌ Status Premium telah *DICABUT*.`);

        try {
            await conn.sendMessage(user, { text: `*[ PREMIUM BERAKHIR ]*\n\nStatus Premium Anda telah dinonaktifkan oleh Admin.\nTerima kasih telah menggunakan layanan kami.` });
        } catch (e) {}
    }
};