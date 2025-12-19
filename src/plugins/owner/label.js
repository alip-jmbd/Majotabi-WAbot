export default {
    cmd: ['label', 'setlabel'],
    tags: ['owner'],
    run: async ({ m, text, config, setBotLabel }) => {
        if (!text) return m.reply(`Ketik text labelnya.\nContoh: *!label Admin Ganteng*`);
        config.botLabel = text;
        await setBotLabel(m.chat, text);
        m.reply('Done.');
    }
};