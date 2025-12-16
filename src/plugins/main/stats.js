import os from 'os';
import { performance } from 'perf_hooks';
import { getDbSize, getTotalMessages } from '../../lib/database.js';

export default {
    cmd: ['stats', 'status'],
    tags: ['main'],
    run: async ({ m, plugins }) => {
        const start = performance.now();
        const old = performance.now();
        const latensi = (old - start).toFixed(4);
        
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);
        
        const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(2);
        const ramUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
        const cpus = os.cpus();
        const cpuModel = cpus.length ? cpus[0].model : 'Unknown';
        
        const dbSize = getDbSize();
        const totalChat = getTotalMessages();

        const text = `
*📊 SERVER STATS*

⚡ *Speed:* ${latensi} ms
🖥️ *RAM:* ${ramUsed}MB / ${ramTotal}MB
⚙️ *CPU:* ${cpuModel} (${cpus.length} Core)
💿 *Platform:* ${os.platform()} - ${os.arch()}

*📂 DATABASE (SQLite)*
🗄️ *Size:* ${dbSize}
📨 *Stored Msgs:* ${totalChat.toLocaleString()}

*🤖 BOT INFO*
⏱️ *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
🧩 *Plugins:* ${plugins.size} Loaded

_Majotabi - WAbot System_
`.trim();

        await m.reply(text);
    }
};
