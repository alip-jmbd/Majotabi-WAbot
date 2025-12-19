export default {
    cmd: ['hidetag', 'h', 'tagall'],
    tags: ['group'],
    run: async ({ conn, m, text, isOwner }) => {
        if (!m.isGroup) return m.reply('Khusus Group.');

        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants;
        const isAdmin = participants.find(p => p.id === m.sender)?.admin;

        if (!isAdmin && !isOwner) return m.reply('Fitur ini khusus Admin Group & Owner Bot.');

        const q = m.quoted ? m.quoted : null;
        const messageText = text || (q ? q.body : '') || 'Tag All';

        const payload = {
            text: messageText,
            contextInfo: {
                mentions: participants.map(a => a.id)
            }
        };

        if (m.expiration) {
            payload.contextInfo.expiration = m.expiration;
        }

        await conn.sendMessage(m.chat, payload);
    }
};