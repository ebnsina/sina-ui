let ctx: AudioContext | undefined;

/**
 * A soft two-note chime, played by the browser: no sound file to ship. Browsers only allow sound after
 * the person has interacted with the page, which starting a timer or setting an alarm already is.
 */
export function chime(times = 1) {
	ctx ??= new AudioContext();
	const start = ctx.currentTime + 0.05;
	for (let i = 0; i < times; i++) {
		for (const [j, freq] of [880, 1318.5].entries()) {
			const at = start + i * 0.9 + j * 0.18;
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = 'sine';
			osc.frequency.value = freq;
			// Quick rise, long fade: a bell, not a beep.
			gain.gain.setValueAtTime(0, at);
			gain.gain.linearRampToValueAtTime(0.25, at + 0.02);
			gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.8);
			osc.connect(gain).connect(ctx.destination);
			osc.start(at);
			osc.stop(at + 0.85);
		}
	}
}
