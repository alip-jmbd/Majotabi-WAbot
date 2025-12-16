export default {
    cmd: ['self'],
    tags: ['owner'],
    run: async ({ m, config, isOwner }) => {
        if (!isOwner) return;
        config.public = false;
        await m.reply('*Sukses!* 🔒\nMode bot diubah menjadi *SELF*.');
    }
};
