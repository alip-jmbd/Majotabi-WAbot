import { getContentType, downloadContentFromMessage } from '@whiskeysockets/baileys';

export function serialize(m, conn) {
    if (!m) return m;

    let M = { ...m };

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
        
        let msg = M.message[M.mtype];
        if (M.mtype === 'ephemeralMessage') {
            msg = M.message.ephemeralMessage.message;
            M.mtype = getContentType(msg);
        }
        if (M.mtype === 'viewOnceMessageV2' || M.mtype === 'viewOnceMessage') {
            msg = M.message[M.mtype].message;
            M.mtype = getContentType(msg);
        }
        
        M.msg = msg;
        M.body = M.msg?.text || M.msg?.caption || M.message?.conversation || '';
        M.expiration = M.msg?.contextInfo?.expiration || 0;

        let quoted = M.quoted = M.msg?.contextInfo?.quotedMessage ? M.msg.contextInfo.quotedMessage : null;
        if (M.quoted) {
            let type = getContentType(quoted);
            let qmsg = quoted[type];
            if (type === 'ephemeralMessage') {
                qmsg = quoted.ephemeralMessage.message;
                type = getContentType(qmsg);
            }
            M.quoted = {
                mtype: type,
                msg: qmsg,
                key: {
                    remoteJid: M.chat,
                    fromMe: conn.user.id.split(':')[0] + '@s.whatsapp.net' === M.msg.contextInfo.participant,
                    id: M.msg.contextInfo.stanzaId,
                    participant: M.msg.contextInfo.participant
                },
                sender: M.msg.contextInfo.participant,
                download: () => downloadContentFromMessage(qmsg, type.replace(/Message/i, ''))
            };
        }
    }

    M.download = () => downloadContentFromMessage(M.msg, M.mtype.replace(/Message/i, ''));

    return M;
}