import util from 'util';

export default {
    cmd: ['>'],
    tags: ['owner'],
    run: async ({ m, conn }) => {
        try {
            let evaled = await eval(m.body.slice(1));
            if (typeof evaled !== 'string') evaled = util.inspect(evaled);
            await m.reply(evaled);
        } catch (e) {
            await m.reply(util.format(e));
        }
    }
};