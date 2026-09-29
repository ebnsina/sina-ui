<script lang="ts">
	import { reduced } from '../motion';
	import type { Snippet } from 'svelte';
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import { setRadioGroup } from './context';

	interface Props extends HTMLFieldsetAttributes {
		/** The question the options answer; every radio group needs one. */
		legend: string;
		value?: string;
		/** Form field name. Defaults to a unique id so separate groups never merge. */
		name?: string;
		disabled?: boolean;
		/** One choice must be made before the form sends. */
		required?: boolean;
		/** Help for the whole group, read out with the question. */
		hint?: string;
		/** Error for the whole group ("Choose a reading room"). */
		error?: string;
		orientation?: 'vertical' | 'horizontal';
		children: Snippet;
	}

	const uid = $props.id();
	let {
		legend,
		value = $bindable(),
		name = uid,
		disabled = false,
		required = false,
		hint,
		error,
		orientation = 'vertical',
		children,
		class: className,
		...rest
	}: Props = $props();

	let fieldset: HTMLFieldSetElement;
	let drop: HTMLSpanElement;
	let pouring: Animation[] = [];

	/**
	 * The dot moves like a drop of liquid, from a small physics simulation run once per choice: the head
	 * is a spring pulled to the new ring and carries its momentum; each trailing droplet is a spring
	 * pulled to the one ahead (surface tension), so the tail lingers, peels away and catches up. A gooey
	 * filter (blur, then a sharp alpha cut) melts the droplets into one body, which thins as it stretches
	 * and squashes on impact in proportion to its speed. The frames play back as transforms only.
	 */
	function pour(from: string, to: string) {
		const dotOf = (x: string) =>
			fieldset
				.querySelector(`input[type="radio"][value="${CSS.escape(x)}"]`)
				?.parentElement?.querySelector<HTMLElement>('.dot');
		const a = dotOf(from);
		const b = dotOf(to);
		if (!a || !b) return;
		for (const an of pouring) an.cancel();
		for (const d of fieldset.querySelectorAll<HTMLElement>('.dot')) d.style.opacity = '';

		const box = drop.getBoundingClientRect();
		const centre = (el: HTMLElement) => {
			const r = el.getBoundingClientRect();
			return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
		};
		const p = centre(a);
		const q = centre(b);
		const d = b.offsetWidth;
		const length = Math.hypot(q.x - p.x, q.y - p.y) || 1;
		const [ux, uy] = [(q.x - p.x) / length, (q.y - p.y) / length];

		// 1D along the path: position in px from the old ring, and velocity, per droplet.
		const sizes = [1, 0.94, 0.88, 0.82, 0.76, 0.7];
		const pos = sizes.map(() => 0);
		const vel = sizes.map(() => 0);
		const maxGap = 0.45 * d; // further apart than this and the liquid would break into beads
		const step = 1 / 240;
		const frames = sizes.map((): Keyframe[] => []);
		const body: Keyframe[] = [];
		let impact = -1; // seconds, when the head first reaches the new ring
		let impactSpeed = 0;
		for (let t = 0, n = 0; t < 0.9; t += step, n++) {
			// Head: underdamped spring to the target (a touch of overshoot). Tail: stiffer springs to the
			// droplet ahead, so it follows closely once it has peeled away.
			for (let i = 0; i < sizes.length; i++) {
				const [goal, k, c] = i === 0 ? [length, 1100, 54] : [pos[i - 1], 3600, 100];
				vel[i] += (k * (goal - pos[i]) - c * vel[i]) * step;
				pos[i] += vel[i] * step;
				if (i > 0) pos[i] = Math.max(pos[i], pos[i - 1] - maxGap);
			}
			if (impact < 0 && pos[0] >= length) [impact, impactSpeed] = [t, vel[0]];
			if (n % 4) continue; // keep every 4th step: 60 frames a second

			// Stretch thins the body (the liquid keeps its volume); impact squashes it across the path
			// and it wobbles back, harder after a faster fall.
			const stretch = (pos[0] - pos[sizes.length - 1]) / d;
			const thin = 1 - 0.14 * Math.min(1, stretch / 2);
			const since = impact < 0 ? -1 : t - impact;
			const squash =
				since < 0
					? 0
					: Math.min(0.22, impactSpeed / 4200) *
						Math.exp(-since / 0.06) *
						Math.cos((2 * Math.PI * since) / 0.12);
			sizes.forEach((size, i) => {
				frames[i].push({
					transform: `translate(${p.x + ux * pos[i] - d / 2}px, ${p.y + uy * pos[i] - d / 2}px) scale(${size * thin})`,
					opacity: 1
				});
			});
			// Squash along the path, bulge across it, around the landing point.
			const [along, across] = [1 - squash, 1 + squash * 0.8];
			const [sx, sy] = Math.abs(ux) > Math.abs(uy) ? [along, across] : [across, along];
			body.push({ transform: `scale(${sx}, ${sy})` });
			const settled =
				t > 0.12 &&
				vel.every((v) => Math.abs(v) < 4) &&
				pos.every((x) => Math.abs(x - length) < 0.3);
			if (settled) break;
		}

		drop.style.setProperty('--d', `${d}px`);
		drop.style.transformOrigin = `${q.x}px ${q.y}px`;
		b.style.opacity = '0';
		const timing = { duration: (frames[0].length - 1) * (1000 / 60), easing: 'linear' };
		pouring = [
			drop.animate(body, timing),
			...[...drop.children].map((el, n) => el.animate(frames[n], timing))
		];
		pouring[0].finished.then(
			() => (b.style.opacity = ''),
			() => {}
		);
	}

	// Last input inside the group; label clicks count as pointer, arrow keys and Space as keyboard.
	let viaKeyboard = false;

	setRadioGroup({
		get name() {
			return name;
		},
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get required() {
			return required;
		},
		get invalid() {
			return !!error;
		},
		select(v) {
			// Pointer choices pour the dot across; keyboard ones snap, as the tabs do.
			const from = value;
			if (!viaKeyboard && from !== undefined && from !== v && !reduced()) pour(from, v);
			value = v;
		}
	});
</script>

<!-- fieldset + legend: the group is announced with its question, and native radios supply arrow keys. -->
<fieldset
	bind:this={fieldset}
	class={['group', orientation, className]}
	{disabled}
	aria-describedby={[hint && `${uid}-hint`, error && `${uid}-error`].filter(Boolean).join(' ') ||
		undefined}
	{...rest}
	onkeydowncapture={(e) => {
		viaKeyboard = true;
		rest.onkeydowncapture?.(e);
	}}
	onpointerdowncapture={(e) => {
		viaKeyboard = false;
		rest.onpointerdowncapture?.(e);
	}}
>
	<legend>{legend}</legend>
	{#if hint}<p id="{uid}-hint" class="hint">{hint}</p>{/if}
	<div class="options">
		{@render children()}
		<span class="drop" aria-hidden="true" style:filter="url(#{uid}-goo)" bind:this={drop}
			><span></span><span></span><span></span><span></span><span></span><span></span></span
		>
		<!-- Gooey filter: the blur melts the droplets together, the alpha cut gives the blob a crisp edge. -->
		<svg class="goo" aria-hidden="true">
			<filter id="{uid}-goo">
				<feGaussianBlur stdDeviation="2" />
				<feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" />
			</filter>
		</svg>
	</div>
	{#if error}<p id="{uid}-error" class="error">{error}</p>{/if}
</fieldset>

<style>
	.group {
		margin: 0;
		padding: 0;
		border: 0;
		min-inline-size: 0;
		font: 0.9375rem/1.5 var(--ui-font);
		color: var(--ui-fg);
	}
	legend {
		margin-block-end: 0.5rem;
		padding: 0;
		font-weight: 500;
	}
	.hint,
	.error {
		margin: 0;
		font-size: 0.8125rem;
	}
	.hint {
		margin-block: -0.25rem 0.5rem;
		color: var(--ui-muted);
	}
	.error {
		margin-block-start: 0.5rem;
		color: var(--ui-danger);
	}
	.options {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.horizontal .options {
		flex-direction: row;
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
	}
	.drop {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
	}
	.drop > span {
		position: absolute;
		top: 0;
		left: 0;
		inline-size: var(--d, 0.625rem);
		block-size: var(--d, 0.625rem);
		border-radius: 50%;
		background: var(--ui-accent);
		opacity: 0;
	}
	.goo {
		position: absolute;
		inline-size: 0;
		block-size: 0;
	}
	@media (forced-colors: active) {
		.drop > span {
			forced-color-adjust: none;
			background: Highlight;
		}
	}
</style>
