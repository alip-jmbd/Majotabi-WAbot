import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import util from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginFolder = path.join(__dirname, '../plugins'); // <-- INI PERBAIKANNYA

export const plugins = new Map();
const debounce = new Map();

async function loadFile(filePath, ownerJid, conn) {
    try {
        const module = await import(filePath + '?update=' + Date.now());
        const filename = path.basename(filePath, '.js');
        if (module.default) {
            plugins.set(filename, module.default);
        }
    } catch (e) {
        console.error(chalk.red.bold(`[ERROR]`), chalk.red(`Failed to load plugin: ${path.basename(filePath)}`));
        console.error(chalk.white.dim(util.format(e) + '\n'));
        
        if (conn && ownerJid) {
            const errorMessage = `Failed to load plugin: *${path.basename(filePath)}*\n\n` + '```' + util.format(e) + '```';
            conn.sendMessage(ownerJid, { text: errorMessage });
        }
    }
}

export async function loadPlugins(ownerJid, conn) {
    const categories = fs.readdirSync(pluginFolder);
    for (const category of categories) {
        const catPath = path.join(pluginFolder, category);
        if (fs.statSync(catPath).isDirectory()) {
            const files = fs.readdirSync(catPath).filter(file => file.endsWith('.js'));
            for (const file of files) {
                await loadFile(path.join(catPath, file), ownerJid, conn);
            }
        }
    }
    console.log(chalk.green.bold('› [PLUGINS]'), chalk.white(`${plugins.size} Plugins loaded successfully.`));
    watchPlugins(ownerJid, conn);
}

function watchPlugins(ownerJid, conn) {
    fs.watch(pluginFolder, { recursive: true }, (eventType, filename) => {
        if (!filename || !filename.endsWith('.js')) return;

        const filePath = path.join(pluginFolder, filename);
        const name = path.basename(filename, '.js');

        if (debounce.has(name)) return;
        debounce.set(name, setTimeout(() => {
            debounce.delete(name);
        }, 200));

        if (fs.existsSync(filePath)) {
            loadFile(filePath, ownerJid, conn).then(() => {
                console.log(chalk.yellow.bold('› [UPDATE]'), chalk.white(`Plugin reloaded: ${name}`));
            });
        } else {
            plugins.delete(name);
            console.log(chalk.red.bold('› [DELETE]'), chalk.white(`Plugin deleted: ${name}`));
        }
    });
}