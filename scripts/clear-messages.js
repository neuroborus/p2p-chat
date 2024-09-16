import Hyperbee from 'hyperbee';
import Hypercore from 'hypercore';
import { unlink } from 'fs/promises';

async function clearMessages() {
    const feed = new Hypercore('./storage', { valueEncoding: 'json' });
    const db = new Hyperbee(feed, { keyEncoding: 'utf-8', valueEncoding: 'json' });

    // Создание потока для чтения всех ключей
    const stream = db.createReadStream();

    // Удаление всех сообщений
    for await (const data of stream) {
        await db.del(data.key);
        console.log(`Message deleted with key: ${data.key}`);
    }

    console.log('All message have been deleted');
}

async function resetHypercore() {
    const feedPath = './storage';
    await unlink(feedPath);
    console.log('Storage deleted');
}

await clearMessages()
// await resetHypercore()
