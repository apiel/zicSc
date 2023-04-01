import { exit } from 'process';
import { close, getEvents, open, render } from 'zic_node_ui';
import { config } from './config';
import { drawError, renderMessage } from './draw/drawMessage';
import './midi';
import { loadPatches } from './patch';
import { loadSequences, setSelectedSequenceId } from './sequence';
import { startClient, startServer } from './tcp';
import { loadTracks } from './track';
import { renderView } from './view';
import { sc } from './sc';

open({ size: config.screen.size });

if (process.argv.includes('--server')) {
    startServer();
}

if (process.argv.includes('--client')) {
    const host = process.argv[process.argv.indexOf('--client') + 1];
    startClient(host);
}

(async function () {
    // await sc();
    await loadTracks();
    await loadPatches();
    await loadSequences();
    setSelectedSequenceId(0);
    await renderView({ controllerRendering: true });
    render();
})();

setInterval(async () => {
    try {
        const events = getEvents();
        // 41=Esc
        if (events.exit || events.keysDown?.includes(41)) {
            close();
            exit();
        }
    } catch (error) {
        console.error(error);
        drawError((error as any).message);
        renderMessage();
        render();
    }
}, 10);
