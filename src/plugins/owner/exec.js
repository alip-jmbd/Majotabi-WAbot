import { exec } from 'child_process';
import util from 'util';

export default {
    cmd: ['$'],
    tags: ['owner'],
    run: async ({ m, text }) => {
        if (!text) return m.reply('Masukkan perintah terminal.');
        exec(text, (err, stdout, stderr) => {
            if (err) return m.reply(util.format(err));
            if (stderr) return m.reply(stderr);
            if (stdout) return m.reply(stdout);
        });
    }
};