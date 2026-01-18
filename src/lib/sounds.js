// Web Audio API Sound Synthesizer

let audioContext = null;

const getContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

const playTone = (freq, type, duration, startTime = 0) => {
    const ctx = getContext();

    // Resume context if suspended (browser policy requires user interaction)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime + startTime);

    // Volume envelope
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    oscillator.stop(ctx.currentTime + startTime + duration);
};

export const playScanSound = () => {
    // Sharp high pitch beep
    playTone(1500, 'sine', 0.1);
};

export const playSuccessSound = () => {
    // Pleasant ascending chime (C5 -> E5)
    playTone(523.25, 'sine', 0.15, 0);
    playTone(659.25, 'sine', 0.3, 0.1);
};

export const playErrorSound = () => {
    // Low error thud
    playTone(150, 'triangle', 0.3);
};

export const playDeleteSound = () => {
    // Descending shrinking sound
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
};
