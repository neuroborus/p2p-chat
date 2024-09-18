import Hyperswarm from 'hyperswarm'; // Module for P2P networking and connecting peers
import crypto from 'hypercore-crypto'; // Cryptographic functions for generating the key in app
import b4a from 'b4a';
import * as storage from '../storage/index.js'; // Module for buffer-to-string and vice-versa conversions

const swarm = new Hyperswarm();

export async function start(Pear) {
    const key = Pear.config.args.pop();       // Retrieve a potential chat room key from command-line arguments
    const shouldCreateSwarm = !key;      // Flag to determine if a new chat room should be created


    // Unannounce the public key before exiting the process
    // (This is not a requirement, but it helps avoid DHT pollution)
    Pear.teardown(() => swarm.destroy());

    // Enable automatic reloading for the app
    // This is optional but helpful during production
    Pear.updates(() => Pear.reload());

    // When there's a new connection, listen for new messages, and output them to the terminal
    swarm.on('connection', async (peer) => {
        const name = b4a.toString(peer.remotePublicKey, 'hex').substr(0, 6);
        console.log(`[info] New peer joined, ${name}`);
        // Send chat history to the new peer
        const history = await storage.getAllMessages();
        history.forEach((item) => {
            peer.write(`${item.username}: ${item.message}`);
        });
        peer.on('data', async (message) => {
            appendMessage({name, message});
            // Store the incoming message in Hyperbee
            await storage.storeMessage({ username: 'Peer', message: b4a.toString(message) });
            console.log(`Received message: ${b4a.toString(message)}`);
        });

        peer.on('error', (error) => {
            console.error(`Peer connection error: ${error}`);
        });

        peer.on('close', () => {
            console.log('Connection closed');
        });
    });

    // When there's updates to the swarm, update the peers count
    swarm.on('update', () => {
        console.log(`[info] Number of connections is now ${swarm.connections.size}`);
    });

    if (shouldCreateSwarm) {
        await createChatRoom();
    } else {
        await joinChatRoom(key);
    }
}

export async function createChatRoom() {
    // Generate a new random topic (32 byte string)
    const topicBuffer = crypto.randomBytes(32);
    // Create a new chat room for the topic
    await joinSwarm(topicBuffer);
    const topic = b4a.toString(topicBuffer, 'hex');
    console.log(`[info] Created new chat room: ${topic}`);
}

export async function joinChatRoom(topicStr) {
    const topicBuffer = b4a.from(topicStr, 'hex');
    await joinSwarm(topicBuffer);
    console.log(`[info] Joined chat room`);
}

export async function joinSwarm(topicBuffer) {
    // Join the swarm with the topic. Setting both client/server to true means that this app can act as both.
    const discovery = swarm.join(topicBuffer, {client: true, server: true}); //  creates a DHT announcement for the given topic, allowing your peers to discover each other by publishing and looking up that topic in the DHT.
    await discovery.flushed();
}

export async function sendMessage(message) {
    // Send the message to all peers (that you are connected to)
    const peers = [...swarm.connections];
    for (const peer of peers) peer.write(message);

    await storage.storeMessage({username: 'You', message});
}

export function appendMessage({name, message}) {
    // Output chat msgs to terminal
    console.log(`[${name}] ${message}`);
}