import tty from 'bare-tty'            // Module to control terminal behavior
import process from 'bare-process'    // Process control for Bare
import {sendMessage} from '../server';


export function setupReadline(rl) {
    rl.input.setMode(tty.constants.MODE_RAW); // Enable raw input mode for efficient key reading
    rl.on('data', async (line) => {
        await sendMessage(line.toString().trim());
        rl.prompt();
    });
    rl.prompt();

    rl.on('close', () => {
        process.kill(process.pid, 'SIGINT')
    });
}
