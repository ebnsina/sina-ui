<script lang="ts">
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Example from '#lib/site/Example.svelte';
	import { examples } from '#lib/site/examples.js';

	const ex = examples(
		import.meta.glob<Component>('./examples/*.svelte', { eager: true, import: 'default' }),
		import.meta.glob<string>('./examples/*.svelte', {
			eager: true,
			query: '?raw',
			import: 'default'
		})
	);
</script>

<svelte:head>
	<title>Clock — Sina UI</title>
	<meta name="description" content="Analog and digital clocks for any time zone." />
	<meta property="og:title" content="Clock — Sina UI" />
	<meta property="og:description" content="Analog and digital clocks for any time zone." />
</svelte:head>

<p class="eyebrow">Widgets</p>
<h1>Clock</h1>
<p class="lede">An analog or digital clock for any time zone, for world clocks and dashboards.</p>

<h2 id="installation">Installation</h2>
<Install names="clock">
	<p>
		Copy <code>src/lib/ui/Clock.svelte</code>, <code>now.svelte.ts</code> and
		<code>tokens.css</code>; for the card around the world clocks, <code>Widget.svelte</code>. No
		dependencies.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="world"
	title="World clocks"
	description="Each says how far ahead or behind your own time it is; faces dim after dark. All clocks on a page tick together."
	{...ex('world')}
/>
<Example id="digital" title="Digital" {...ex('digital')} />
<Example
	id="led"
	title="LED"
	description="Seven-segment digits on a dark panel. Segments fade as they change, the colon blinks each second."
	{...ex('led')}
/>
<Example
	id="led-color"
	title="LED, your own color"
	description="Any color for the segments; here without seconds, in another time zone."
	{...ex('led-color')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>timeZone</code></td><td
				><code>string</code>: IANA, like <code>'Asia/Baghdad'</code></td
			><td>the reader’s</td></tr
		>
		<tr><td><code>label</code></td><td><code>string</code>: a place name</td><td></td></tr>
		<tr
			><td><code>variant</code></td><td><code>'analog' | 'digital' | 'led'</code></td><td
				><code>'analog'</code></td
			></tr
		>
		<tr
			><td><code>color</code></td><td><code>string</code>: lit color, LED only</td><td
				><code>'#3ee6a2'</code></td
			></tr
		>
		<tr><td><code>seconds</code></td><td><code>boolean</code></td><td><code>true</code></td></tr>
		<tr
			><td><code>size</code></td><td><code>number</code>: analog diameter in px</td><td
				><code>144</code></td
			></tr
		>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>
<p>
	For your own live times, <code>now()</code> from <code>now.svelte.ts</code> returns the current time
	and updates every second wherever it's read.
</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Read as the place and the time to the minute (“Baghdad, 4:05 PM”), never ticking aloud every
		second.
	</li>
	<li>
		Nothing is shown until the time is known in the browser, so it never flashes a wrong time.
	</li>
	<li>With reduced motion, the second hand moves without its tick.</li>
</ul>
