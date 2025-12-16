export default {
    cmd: ['label', 'setlabel'],
    tags: ['owner'],
    run: async ({ m, text, config, isOwner, setBotLabel }) => {
        if (!isOwner) return;
        if (!text) return m.reply(`Ketik text labelnya.\nContoh: *!label Admin Ganteng*`);

        config.botLabel = text;
        await setBotLabel(m.chat, text);
        
        m.reply('Done.');
    }
};
