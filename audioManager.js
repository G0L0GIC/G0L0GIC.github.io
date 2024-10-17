let audioContext;
const audioBuffers = {};

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

async function loadAudio(url) {
    if (!audioBuffers[url]) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffers[url] = await audioContext.decodeAudioData(arrayBuffer);
    }
    return audioBuffers[url];
}

function playSound(buffer, loop = false) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.loop = loop;
    source.start();
    return source;
}

let backgroundMusic;

async function playBackgroundMusic() {
    const buffer = await loadAudio('Audio/fruitloop.ogg');
    backgroundMusic = playSound(buffer, true);
}

async function playCollectSound() {
    const buffer = await loadAudio('Audio/collect.ogg');
    playSound(buffer);
}

async function playClickSound() {
    const buffer = await loadAudio('Audio/click2.ogg');
    playSound(buffer);
}

async function playWooshSound() {
    const buffer = await loadAudio('Audio/woosh.ogg');
    playSound(buffer);
}


export { initAudio, playBackgroundMusic, playCollectSound, playClickSound, playWooshSound };