<script lang="ts">
	import { ArrowTurnBackwardIcon, Delete02Icon, KeyboardIcon } from '@hugeicons/core-free-icons';
	import { onMount } from 'svelte';
	import { isApple } from './announce';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Input from './Input.svelte';

	interface Props {
		/** Names the pad ("Signature"). */
		label?: string;
		/** Printed under the line, as on paper. */
		signer?: string;
		/** The signature as a PNG data URL; empty until something is drawn or typed. */
		value?: string;
		empty?: boolean;
		/** Posts the PNG data URL with a native form. */
		name?: string;
		class?: string;
	}

	let {
		label = 'Signature',
		signer,
		value = $bindable(''),
		empty = $bindable(true),
		name,
		class: className
	}: Props = $props();

	// Points are stored as fractions of the pad, so a resize redraws the same signature at the new size.
	type Point = { x: number; y: number; w: number };
	let strokes: Point[][] = [];
	let typing = $state(false);
	let typed = $state('');
	let canvas: HTMLCanvasElement;
	let root = $state<HTMLDivElement>();
	let pressedHere = false;
	let ctx: CanvasRenderingContext2D;
	let size = { w: 0, h: 0 };
	let drawing: Point[] | null = null;
	let last = { x: 0, y: 0, t: 0, w: 0 };

	const MIN = 0.9;
	const MAX = 3.2;

	function ink() {
		return getComputedStyle(canvas).color;
	}

	// A quadratic curve through each point's midpoint: smooth ink without storing control points.
	function drawStroke(pts: Point[]) {
		const { w, h } = size;
		if (pts.length === 1) {
			ctx.beginPath();
			ctx.arc(pts[0].x * w, pts[0].y * h, pts[0].w / 2, 0, Math.PI * 2);
			ctx.fill();
			return;
		}
		for (let i = 1; i < pts.length; i++) {
			const a = pts[i - 1];
			const b = pts[i];
			const prev = pts[i - 2] ?? a;
			ctx.beginPath();
			ctx.lineWidth = (a.w + b.w) / 2;
			ctx.moveTo(((prev.x + a.x) / 2) * w, ((prev.y + a.y) / 2) * h);
			ctx.quadraticCurveTo(a.x * w, a.y * h, ((a.x + b.x) / 2) * w, ((a.y + b.y) / 2) * h);
			ctx.stroke();
		}
	}

	function redraw() {
		if (!ctx) return;
		const dpr = devicePixelRatio || 1;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, size.w, size.h);
		ctx.strokeStyle = ctx.fillStyle = ink();
		ctx.lineCap = ctx.lineJoin = 'round';
		if (typing) {
			if (!typed.trim()) return;
			const px = Math.min(size.h * 0.42, (size.w * 1.6) / Math.max(typed.length, 6));
			ctx.font = `italic 500 ${px}px ${getComputedStyle(canvas).fontFamily}`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'alphabetic';
			ctx.fillText(typed.trim(), size.w / 2, size.h * 0.66, size.w * 0.9);
			return;
		}
		for (const s of strokes) drawStroke(s);
	}

	function commit() {
		empty = typing ? !typed.trim() : strokes.length === 0;
		value = empty ? '' : canvas.toDataURL('image/png');
	}

	function pos(e: PointerEvent) {
		const r = canvas.getBoundingClientRect();
		return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
	}
	// Faster strokes draw thinner, like a nib; a pen's pressure takes over when it reports one.
	function width(e: PointerEvent, x: number, y: number) {
		if (e.pointerType === 'pen' && e.pressure > 0 && e.pressure !== 0.5)
			return MIN + (MAX - MIN) * e.pressure;
		const dt = Math.max(1, e.timeStamp - last.t);
		const v = Math.hypot((x - last.x) * size.w, (y - last.y) * size.h) / dt;
		const target = Math.max(MIN, MAX - v * 1.1);
		return last.w ? last.w * 0.7 + target * 0.3 : target;
	}

	function down(e: PointerEvent) {
		if (typing || e.button !== 0) return;
		canvas.setPointerCapture(e.pointerId);
		const { x, y } = pos(e);
		last = { x, y, t: e.timeStamp, w: 0 };
		drawing = [{ x, y, w: (MIN + MAX) / 2 }];
		strokes.push(drawing);
		redraw();
	}
	function move(e: PointerEvent) {
		if (!drawing) return;
		for (const ev of e.getCoalescedEvents?.() ?? [e]) {
			const { x, y } = pos(ev);
			const w = width(ev, x, y);
			drawing.push({ x, y, w });
			last = { x, y, t: ev.timeStamp, w };
		}
		redraw();
	}
	function up() {
		if (!drawing) return;
		drawing = null;
		commit();
	}

	function undo() {
		strokes.pop();
		redraw();
		commit();
	}
	function clear() {
		strokes = [];
		typed = '';
		redraw();
		commit();
	}

	/** The signature as SVG markup, or '' when empty. Typed signatures come back as PNG only. */
	export function toSVG() {
		if (!strokes.length) return '';
		const { w, h } = size;
		const paths = strokes
			.map((pts) => {
				const d = pts
					.map((p, i) => `${i ? 'L' : 'M'}${(p.x * w).toFixed(1)} ${(p.y * h).toFixed(1)}`)
					.join('');
				const avg = pts.reduce((sum, p) => sum + p.w, 0) / pts.length;
				return `<path d="${d}" stroke-width="${avg.toFixed(2)}"/>`;
			})
			.join('');
		return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
	}
	/** The signature as a PNG data URL, or '' when empty. */
	export const toPNG = () => value;

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		const resize = new ResizeObserver(() => {
			const r = canvas.getBoundingClientRect();
			size = { w: r.width, h: r.height };
			const dpr = devicePixelRatio || 1;
			canvas.width = Math.round(r.width * dpr);
			canvas.height = Math.round(r.height * dpr);
			redraw();
		});
		resize.observe(canvas);
		// Ink follows the theme: redraw when it changes.
		const theme = new MutationObserver(redraw);
		theme.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme', 'class']
		});
		const scheme = matchMedia('(prefers-color-scheme: dark)');
		scheme.addEventListener('change', redraw);
		return () => {
			resize.disconnect();
			theme.disconnect();
			scheme.removeEventListener('change', redraw);
		};
	});

	$effect(() => {
		void [typing, typed];
		redraw();
		if (ctx) commit();
	});
</script>

<!-- ⌘Z / Ctrl Z undoes the last stroke while focus is in the pad, or it was the last thing pressed. -->
<svelte:window
	onpointerdowncapture={(e) => (pressedHere = !!root?.contains(e.target as Node))}
	onkeydown={(e) => {
		if (
			(pressedHere || root?.contains(document.activeElement)) &&
			e.key.toLowerCase() === 'z' &&
			(isApple() ? e.metaKey : e.ctrlKey) &&
			!e.shiftKey &&
			!typing
		) {
			e.preventDefault();
			undo();
		}
	}}
/>

<div class={['signature', className]} role="group" aria-label={label} bind:this={root}>
	<span class="label" aria-hidden="true">{label}</span>
	<div class={['pad', !empty && 'signed', typing && 'typing']}>
		<canvas
			bind:this={canvas}
			aria-hidden="true"
			onpointerdown={down}
			onpointermove={move}
			onpointerup={up}
			onpointercancel={up}
		></canvas>
		<span class="hint" aria-hidden="true"
			>{typing ? 'Type your name below' : 'Sign above the line'}</span
		>
		<span class="line" aria-hidden="true"><span class="x">×</span></span>
		{#if signer}<span class="signer">{signer}</span>{/if}
	</div>
	<p class="sr" aria-live="polite">
		{empty ? 'Nothing signed yet.' : typing ? `Signed as ${typed.trim()}.` : 'Signature drawn.'}
	</p>

	{#if typing}
		<Input label="Your name" bind:value={typed} autocomplete="name" />
	{/if}

	<div class="actions">
		<Button
			variant="ghost"
			size="sm"
			onclick={() => {
				typing = !typing;
				if (!typing) typed = '';
			}}
		>
			<Icon icon={KeyboardIcon} size={16} />
			{typing ? 'Draw instead' : 'Type instead'}
		</Button>
		<span class="end">
			{#if !typing}
				<Button variant="ghost" size="sm" disabled={empty} onclick={undo}>
					<Icon icon={ArrowTurnBackwardIcon} size={16} /> Undo
				</Button>
			{/if}
			<Button variant="ghost" size="sm" disabled={empty} onclick={clear}>
				<Icon icon={Delete02Icon} size={16} /> Clear
			</Button>
		</span>
	</div>
	{#if name}<input type="hidden" {name} {value} />{/if}
</div>

<style>
	.signature {
		display: grid;
		gap: 0.5rem;
		min-inline-size: 0;
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
	}
	.label {
		font-weight: 500;
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		margin: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	/* A field: bordered like any input, with a signing line near the bottom. */
	.pad {
		position: relative;
		block-size: 11rem;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		overflow: hidden;
	}
	canvas {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		color: var(--ui-fg);
		touch-action: none;
		cursor: crosshair;
	}
	.typing canvas {
		cursor: default;
	}
	.hint {
		position: absolute;
		inset-inline: 0;
		inset-block-start: 38%;
		color: var(--ui-muted);
		text-align: center;
		pointer-events: none;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			translate var(--ui-dur) var(--ui-ease-out);
	}
	/* The hint steps aside the moment there's ink. */
	.signed .hint {
		opacity: 0;
		translate: 0 -0.25rem;
	}
	.line {
		position: absolute;
		inset-inline: 1.5rem;
		inset-block-end: 2.5rem;
		block-size: 1px;
		background: var(--ui-field-line);
		pointer-events: none;
	}
	.x {
		position: absolute;
		inset-inline-start: 0;
		inset-block-end: 0.25rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
		line-height: 1;
	}
	.signer {
		position: absolute;
		inset-inline-start: 1.5rem;
		inset-block-end: 0.75rem;
		color: var(--ui-muted);
		font-size: 0.8125rem;
		pointer-events: none;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.25rem;
	}
	.end {
		display: flex;
		gap: 0.25rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.hint {
			translate: 0 0;
		}
	}
</style>
