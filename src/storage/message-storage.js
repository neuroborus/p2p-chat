import Hypercore from 'hypercore';
import Hyperbee from 'hyperbee';

// Create a new Hypercore feed
const feed = new Hypercore(
    './storage',
    {
        valueEncoding: 'json' // Store messages as JSON
    }
);

// Initialize Hyperbee on top of Hypercore
const db = new Hyperbee(
    feed,
    {
        keyEncoding: 'utf-8', // Key encoding (e.g., message ID, timestamp)
        valueEncoding: 'json' // Value encoding (e.g., message content)
    }
);

await feed.ready();

export async function storeMessage({username, message}) {
    const timestamp = `${Date.now()}`;
    await db.put(timestamp, {username, message});
    console.log(`Stored message: ${message} by ${username}`);
}

export async function getAllMessages() {
    const stream = db.createReadStream();

    const history = [];
    for await (const {key, value} of stream) {
        history.push({
            key,
            username: value.username,
            message: value.message,
        });
        // console.log(`Message at ${key}: ${value.username}: ${value.message}`)
    }
    return history;
}
