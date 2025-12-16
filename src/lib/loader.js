import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginFolder = path.join(__dirname, '../plugins');

export const plugins = new Map();

async function loadFile(filePath) {
    try {
        const module = await import(filePath + '?update=' + Date.now());
        const filename = path.basename(filePath, '.js');
        if (module.default) {
            plugins.set(filename, module.default);
        }
    } catch (e) {
        console.error(chalk.red(`Error loading ${filePath}:`), e);
    }
}

export async function loadPlugins() {
    const categories = fs.readdirSync(pluginFolder);
    for (const category of categories) {
        const catPath = path.join(pluginFolder, category);
        if (fs.statSync(catPath).isDirectory()) {
            const files = fs.readdirSync(catPath).filter(file => file.endsWith('.js'));
            for (const file of files) {
                await loadFile(path.join(catPath, file));
            }
        }
    }
    console.log(chalk.green(`✓ ${plugins.size} Plugins Loaded`));
    watchPlugins();
}

function watchPlugins() {
    fs.watch(pluginFolder, { recursive: true }, async (eventType, filename) => {
        if (!filename || !filename.endsWith('.js')) return;
        const filePath = path.join(pluginFolder, filename);
        const name = path.basename(filename, '.js');

        if (eventType === 'change' || eventType === 'rename') {
            if (fs.existsSync(filePath)) {
                await loadFile(filePath);
                console.log(chalk.yellow(`[UPDATE] Plugin: ${name}`));
            } else {
                plugins.delete(name);
                console.log(chalk.red(`[DELETE] Plugin: ${name}`));
            }
        }
    });
}
