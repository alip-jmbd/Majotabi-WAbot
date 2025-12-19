import os from 'os';
import v8 from 'v8';
import { performance } from 'perf_hooks';
import { getDbSize, getTotalMessages } from '../../lib/database.js';

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB', 'TB'][i]}`;
};

const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
};

export default {
    cmd: ['stats', 'status'],
    tags: ['main'],
    run: async ({ m, plugins, config }) => {
        const start = performance.now();

        const cpus = os.cpus();
        const cpuModel = cpus[0].model.split('@')[0].trim();
        const cpuCore = cpus.length;

        const totalRam = os.totalmem();
        const freeRam = os.freemem();
        const usedRam = totalRam - freeRam;

        const heapStats = v8.getHeapStatistics();
        const heapUsed = heapStats.used_heap_size;
        const heapTotal = heapStats.heap_size_limit;

        const dbSize = getDbSize();
        const totalChat = getTotalMessages();

        const end = performance.now();
        const latency = (end - start).toFixed(3);

        const text = `
*📊 Bot Status*

*🖥️ Server Info*
_Platform:_ *${os.type()} (${os.platform()})*
_Uptime:_ *${formatUptime(os.uptime())}*
_CPU:_ *${cpuModel} (${cpuCore} Core)*
_Memory:_ *${formatSize(usedRam)} / ${formatSize(totalRam)}*

*⚡ Runtime Info*
_Node.js:_ *${process.version}*
_Uptime:_ *${formatUptime(process.uptime())}*
_Memory:_ *${formatSize(process.memoryUsage().rss)}*
_Heap:_ *${formatSize(heapUsed)} / ${formatSize(heapTotal)}*

*☘️ Bot Info*
_Name:_ *${config.botName}*
_Owner:_ *${config.ownerName}*
_Mode:_ *${config.public ? 'Public' : 'Self'}*
_Plugins:_ *${plugins.size} Loaded*
_Latency:_ *${latency} ms*

*🗄️ Database Info*
_Type:_ *SQLite*
_Size:_ *${dbSize}*
_Messages:_ *${totalChat.toLocaleString()} Stored*
`.trim();

        await m.reply(text);
    }
};