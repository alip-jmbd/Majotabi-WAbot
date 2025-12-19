export default {
    cmd: ['public'],
    tags: ['owner'],
    run: async ({ m, config }) => {
        if (config.public === true) {
            return m.reply('*Gagal!* ⚠️\nBot sudah dalam mode *PUBLIC* sebelumnya.');
        }
        config.public = true;
        await m.reply('*Sukses!* 🌍\nMode bot diubah menjadi *PUBLIC*.');
    }
};