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
	<title>Alarm clock — Sina UI</title>
	<meta name="description" content="Alarms that ring at a time of day, with snooze." />
	<meta property="og:title" content="Alarm clock — Sina UI" />
	<meta property="og:description" content="Alarms that ring at a time of day, with snooze." />
</svelte:head>

<p class="eyebrow">Widgets</p>
<h1>Alarm clock</h1>
<p class="lede">Alarms for times of day: switch each on or off, and snooze when it rings.</p>

<h2 id="installation">Installation</h2>
<Install names="alarm-clock">
	<p>
		Copy <code>src/lib/ui/Widget.svelte</code>, <code>src/lib/ui/AlarmClock.svelte</code>,
		<code>chime.ts</code>, <code>now.svelte.ts</code>
		and the components it uses: <code>TimeField</code>, <code>Input</code>, <code>Switch</code>,
		<code>Dialog</code>, <code>Button</code> and <code>Icon</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Alarms"
	description="Add one for a minute from now to hear it. Alarms are remembered in this browser; they ring while the page is open."
	{...ex('basic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>alarms</code></td><td><code>Alarm[]</code>, bindable</td><td><code>[]</code></td
			></tr
		>
		<tr><td><code>persist</code></td><td><code>string</code>: a storage key</td><td></td></tr>
		<tr><td><code>snooze</code></td><td><code>number</code>: minutes</td><td><code>5</code></td></tr
		>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		When one rings, a dialog opens and the alarm is announced; Stop and Snooze are its buttons, and
		Escape stops it.
	</li>
	<li>Each switch is named for its alarm (“Fajr at 5:15 AM”), as is each delete button.</li>
	<li>“Next alarm in…” is read when it changes.</li>
</ul>
