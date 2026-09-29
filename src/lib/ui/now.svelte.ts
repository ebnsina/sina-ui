import { createSubscriber } from 'svelte/reactivity';

let current = Date.now();

// One ticker for every clock on the page, on the whole second, running only while something reads it.
const subscribe = createSubscriber((update) => {
	let timer: ReturnType<typeof setTimeout>;
	const tick = () => {
		current = Date.now();
		update();
		timer = setTimeout(tick, 1000 - (current % 1000));
	};
	tick();
	return () => clearTimeout(timer);
});

/** The current time in ms, reactive: effects and templates that read it update every second. */
export function now() {
	subscribe();
	return current;
}
