import { performance } from 'perf_hooks';

export default {
    cmd: ['ping', 'p'],
    tags: ['main'],
    run: async ({ m }) => {
        const start = performance.now();
        const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
        const old = performance.now();
        const latensi = (old - start).toFixed(3);
        
        await m.reply(`*Pong!* 🪷\n> _Latency: ${latensi}ms_`);
    }
};
