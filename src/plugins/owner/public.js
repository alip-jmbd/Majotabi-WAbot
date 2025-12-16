export default {
    cmd: ['public'],
    tags: ['owner'],
    run: async ({ m, config, isOwner }) => {
        if (!isOwner) return;
        config.public = true;
        await m.reply('*Sukses!* 🌍\nMode bot diubah menjadi *PUBLIC*.');
    }
};
