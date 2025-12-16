import { getContentType } from "@whiskeysockets/baileys";

export function serialize(m, conn) {
    if (!m) return m;
    let M = m;
    if (M.key) {
        M.id = M.key.id;
        M.isBaileys = M.id.startsWith("BAE5") && M.id.length === 16;
        M.chat = M.key.remoteJid;
        M.fromMe = M.key.fromMe;
        M.isGroup = M.chat.endsWith("@g.us");
        M.sender = M.fromMe ? (conn.user.id.split(":")[0] + "@s.whatsapp.net" || conn.user.id) : (M.key.participant || M.key.remoteJid);
    }
    if (M.message) {
        M.mtype = getContentType(M.message);
        M.msg = (M.mtype == "viewOnceMessage" ? M.message[M.mtype].message[getContentType(M.message[M.mtype].message)] : M.message[M.mtype]);
        M.body = M.message.conversation || M.msg.caption || M.msg.text || (M.mtype == "listResponseMessage") && M.msg.singleSelectReply.selectedRowId || (M.mtype == "buttonsResponseMessage") && M.msg.selectedButtonId || (M.mtype == "viewOnceMessage") && M.msg.caption || M.text || "";
        M.messageTimestamp = M.messageTimestamp || M.timestamp;
        M.pushName = M.pushName || (M.key.fromMe ? conn.user.name : '');
        
        let quoted = M.msg.contextInfo ? M.msg.contextInfo.quotedMessage : null;
        if(quoted) {
            M.quoted = {
                key: M.msg.contextInfo.stanzaId,
                sender: M.msg.contextInfo.participant,
                message: quoted,
                body: quoted.conversation || quoted.extendedTextMessage?.text || ''
            }
        }
    }
    return M;
}
