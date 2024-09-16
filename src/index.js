import * as server from './server';
import * as ui from './ui';

/* global Pear */
import readline from 'bare-readline'  // Module for reading user input in terminal
import tty from 'bare-tty'            // Module to control terminal behavior

const rl = readline.createInterface({
    input: new tty.ReadStream(0),
    output: new tty.WriteStream(1)
})
ui.setupReadline(rl);

async function createChatRoom () {
    await server.createChatRoom();
}

async function joinChatRoom (topicStr) {
    await server.joinChatRoom(topicStr);
}

async function joinSwarm (topicBuffer) {
    await server.joinSwarm(topicBuffer);
}

function sendMessage (message) {
    server.sendMessage(message);
}

function appendMessage ({ name, message }) {
    server.appendMessage({ name, message });
}
