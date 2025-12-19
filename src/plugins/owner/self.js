export default {
    cmd: ['self'],
    tags: ['owner'],
    run: async ({ m, config }) => {
        if (config.public === false) {
            return m.reply('*Gagal!* ⚠️\nBot sudah dalam mode *SELF* sebelumnya.');
        }
        config.public = false;
        await m.reply('*Sukses!* 🔒\nMode bot diubah menjadi *SELF*.');
    }
};