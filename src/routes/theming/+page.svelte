<script lang="ts">
	import Badge from '#lib/ui/Badge.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Code from '#lib/site/Code.svelte';
	import Input from '#lib/ui/Input.svelte';
	import Progress from '#lib/ui/Progress.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';
	import Slider from '#lib/ui/Slider.svelte';
	import Switch from '#lib/ui/Switch.svelte';

	// Accents in light/dark pairs, each with a text colour that reads on it at 4.5:1 or better.
	const accents = {
		emerald: {
			label: 'Emerald',
			accent: 'light-dark(#047857, #34d399)',
			on: 'light-dark(#ffffff, #022c22)'
		},
		indigo: {
			label: 'Indigo',
			accent: 'light-dark(#4338ca, #a5b4fc)',
			on: 'light-dark(#ffffff, #1e1b4b)'
		},
		rose: {
			label: 'Rose',
			accent: 'light-dark(#be123c, #fda4af)',
			on: 'light-dark(#ffffff, #4c0519)'
		},
		sky: {
			label: 'Sky',
			accent: 'light-dark(#0369a1, #7dd3fc)',
			on: 'light-dark(#ffffff, #082f49)'
		},
		amber: {
			label: 'Amber',
			accent: 'light-dark(#b45309, #fbbf24)',
			on: 'light-dark(#ffffff, #451a03)'
		}
	};
	let accent = $state<keyof typeof accents>('emerald');
	// Corners in named steps; the last makes controls fully round (surfaces stop at 16px).
	const corners = [
		{ name: 'Sharp', px: 0 },
		{ name: 'Subtle', px: 4 },
		{ name: 'Soft', px: 8 },
		{ name: 'Round', px: 12 },
		{ name: 'Rounder', px: 16 },
		{ name: 'Pill', px: 16, pill: true }
	];
	let step = $state(2);
	let mode = $state<'light' | 'dark'>('light');
	let notify = $state(true);
	let loan = $state('2w');

	const chosen = $derived(accents[accent]);
	const corner = $derived(corners[step]);
	const surface = $derived(`${corner.px / 16}rem`);
	const control = $derived(corner.pill ? '999px' : surface);
	const css = $derived(`:root {
	--ui-accent: ${chosen.accent};
	--ui-on-accent: ${chosen.on};
	--ui-radius: ${surface};
	--ui-radius-control: ${control};
}`);

	const tokens: [string, string, boolean][] = [
		['--ui-bg', 'The page', true],
		['--ui-surface', 'Cards, menus, dialogs', true],
		['--ui-fg', 'Text', true],
		['--ui-muted', 'Secondary text', true],
		['--ui-subtle', 'Quiet fills: tags, tracks, hover rows', true],
		['--ui-hover', 'A step stronger than subtle', true],
		['--ui-line', 'Hairlines between things', true],
		['--ui-field-line', 'Text field borders', true],
		['--ui-control-line', 'Checkbox and radio outlines', true],
		['--ui-accent', 'Brand colour: primary buttons, focus, selection', true],
		['--ui-on-accent', 'Text on the accent', true],
		['--ui-danger', 'Errors and destructive actions', true],
		['--ui-on-danger', 'Text on danger', true],
		['--ui-warning', 'Warnings', true],
		['--ui-backdrop', 'Behind dialogs', true],
		['--ui-ring', 'Focus ring colour (the accent)', true],
		['--ui-ring-width', 'Focus ring thickness', false],
		['--ui-ring-offset', 'Gap between ring and control', false],
		['--ui-radius', 'Corners of surfaces: cards, menus, dialogs', false],
		['--ui-radius-control', 'Corners of controls: buttons, fields, tags; 999px for pills', false],
		['--ui-shadow-card', 'Resting cards', false],
		['--ui-shadow-overlay', 'Menus, popovers, dialogs', false],
		['--ui-font', 'Text', false],
		['--ui-font-mono', 'Code and numbers', false],
		['--ui-ease-out', 'Things arriving', false],
		['--ui-ease-in-out', 'Things moving on screen', false],
		['--ui-ease-drawer', 'Sheets and drawers', false],
		['--ui-dur-press', 'Press feedback', false],
		['--ui-dur', 'Most transitions', false],
		['--ui-dur-overlay', 'Overlays opening', false]
	];
</script>

<svelte:head>
	<title>Theming — Sina UI</title>
	<meta
		name="description"
		content="Change Sina UI's colours, corners, type and motion with a few CSS variables."
	/>
	<meta property="og:title" content="Theming — Sina UI" />
	<meta
		property="og:description"
		content="Change Sina UI's colours, corners, type and motion with a few CSS variables."
	/>
</svelte:head>

<p class="eyebrow">Getting started</p>
<h1>Theming</h1>
<p class="lede">
	Every component takes its colours, corners, type and motion from a few CSS variables in
	<code>tokens.css</code>. Change them once and everything follows.
</p>

<h2 id="try">Try it</h2>
<div class="lab-wrap">
	<div class="lab">
		<div class="controls">
			<fieldset class="accents">
				<legend>Accent</legend>
				<div class="swatches">
					{#each Object.entries(accents) as [key, a] (key)}
						<label class="swatch" style:--c={a.accent} title={a.label}>
							<input type="radio" name="accent" value={key} bind:group={accent} />
							<span class="sr-only">{a.label}</span>
						</label>
					{/each}
				</div>
			</fieldset>
			<Slider
				label="Corners"
				min={0}
				max={corners.length - 1}
				bind:value={step}
				format={(v) => corners[v].name}
			/>
			<Segmented
				label="Preview in"
				options={[
					{ value: 'light', label: 'Light' },
					{ value: 'dark', label: 'Dark' }
				]}
				bind:value={() => mode, (v) => (mode = v as typeof mode)}
			/>
		</div>

		<!-- The preview takes the theme through the same variables your app would set. -->
		<div
			class="stage"
			style:color-scheme={mode}
			style:--ui-accent={chosen.accent}
			style:--ui-on-accent={chosen.on}
			style:--ui-ring={chosen.accent}
			style:--ui-radius={surface}
			style:--ui-radius-control={control}
		>
			<article class="book">
				<header>
					<div>
						<p class="kicker">Manuscript · MS-1021</p>
						<h3>Book of Optics</h3>
					</div>
					<Progress shape="circle" label="Read" value={64} size={48} showValue={false} />
				</header>
				<div class="tags">
					<Badge tone="accent">Optics</Badge>
					<Badge>Cairo</Badge>
					<Badge tone="warning" dot>2 waiting</Badge>
				</div>
				<Input label="Reader's name" placeholder="Ibn Sina" />
				<Segmented
					label="Borrow for"
					options={[
						{ value: '1w', label: '1 week' },
						{ value: '2w', label: '2 weeks' },
						{ value: '1m', label: 'A month' }
					]}
					bind:value={loan}
				/>
				<Switch bind:checked={notify}>Tell me when it's back</Switch>
				<footer>
					<Button variant="ghost">Details</Button>
					<Button variant="secondary">Reserve</Button>
					<Button>Borrow</Button>
				</footer>
			</article>
		</div>
	</div>
</div>
<p>Add your choice after <code>tokens.css</code>:</p>
<Code code={css} lang="css" label="Theme overrides" />

<h2 id="corners">Corners</h2>
<p>
	Surfaces and controls round separately. <code>--ui-radius</code> shapes cards, menus and dialogs;
	<code>--ui-radius-control</code> shapes buttons, fields and tags. Set the control radius to
	<code>999px</code> for pill-shaped controls while cards keep their corners.
</p>

<h2 id="dark-mode">Dark mode</h2>
<p>
	Every colour is a <code>light-dark()</code> pair, so pages follow the reader's system setting. To
	let people choose, set <code>data-theme="light"</code> or <code>"dark"</code> on
	<code>&lt;html&gt;</code>.
</p>
<p>
	When you change a colour, give both halves: <code>light-dark(#4338ca, #a5b4fc)</code>. Check that
	text on it reads at 4.5:1 in each.
</p>

<h2 id="type">Type</h2>
<p>
	Components use <code>--ui-font</code> for text and <code>--ui-font-mono</code> for code. Load your fonts
	as usual, then point these at them.
</p>

<h2 id="tokens">All tokens</h2>
<table class="tokens">
	<thead><tr><th>Token</th><th>Used for</th></tr></thead>
	<tbody>
		{#each tokens as [name, use, colour] (name)}
			<tr>
				<td>
					<span class="token">
						{#if colour}<span class="swatch" style:background="var({name})"></span>{/if}
						<code>{name}</code>
					</span>
				</td>
				<td>{use}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	/* Controls beside the preview; stacked when there isn't room. */
	.lab-wrap {
		container: lab / inline-size;
		margin-block: 1rem;
	}
	.lab {
		display: grid;
		grid-template-columns: minmax(13rem, 16rem) minmax(0, 1fr);
		gap: 0.5rem;
		padding: 0.5rem;
		border-radius: 1.5rem;
		background: var(--ui-subtle);
	}
	@container lab (width < 40rem) {
		.lab {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.controls {
		display: grid;
		align-content: start;
		gap: 1.5rem;
		padding: 1.25rem 1rem;
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-block-end: 0.5rem;
		padding: 0;
		font: 500 0.9375rem/1.5 var(--ui-font);
	}
	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 0.625rem;
	}
	/* A colour dot per accent; the chosen one wears a ring in its own colour. */
	.swatch {
		position: relative;
		display: block;
		inline-size: 2rem;
		block-size: 2rem;
		border-radius: 50%;
		background: var(--c);
		box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.08);
		cursor: pointer;
		transition: transform var(--ui-dur-press) var(--ui-ease-out);
	}
	.swatch:active {
		transform: scale(0.92);
	}
	.swatch input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}
	.swatch:has(input:checked) {
		outline: 2px solid var(--c);
		outline-offset: 3px;
	}
	.swatch:has(input:focus-visible) {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 3px;
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	/* The preview's own page, in the chosen scheme; concentric with the lab (1.5rem less its 0.5rem inset). */
	.stage {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		place-items: center;
		padding: 2rem 1.25rem;
		border-radius: 1rem;
		background: var(--ui-bg);
		color: var(--ui-fg);
		transition: background-color var(--ui-dur-overlay) ease;
	}
	/* A card: its corners follow the surface radius, however round the controls get. */
	.book {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
		inline-size: min(22rem, 100%);
		padding: 1.25rem;
		box-sizing: border-box;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		transition: border-radius var(--ui-dur) var(--ui-ease-out);
	}
	.book header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.kicker {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.book h3 {
		margin: 0.125rem 0 0;
		font-size: 1.125rem;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}
	.book footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-block-start: 0.25rem;
	}
	.token {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		white-space: nowrap;
	}
	.swatch {
		inline-size: 1rem;
		block-size: 1rem;
		border-radius: 0.25rem;
		box-shadow: inset 0 0 0 1px var(--ui-line);
	}
</style>
