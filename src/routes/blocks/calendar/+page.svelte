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
	<title>Calendar — Sina UI</title>
	<meta
		name="description"
		content="A full calendar app: month, week and day views with drag to create, move and resize."
	/>
	<meta property="og:title" content="Calendar — Sina UI" />
	<meta
		property="og:description"
		content="A full calendar app: month, week and day views with drag to create, move and resize."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Calendar</h1>
<p class="lede">
	A complete calendar: month, week and day views, several calendars you can show or hide, and events
	you draw, drag and resize.
</p>

<h2 id="installation">Installation</h2>
<Install names="blocks/calendar">
	<p>
		Copy <code>src/lib/blocks/calendar/</code>, and the <code>Button</code>, <code>Calendar</code>,
		<code>Checkbox</code>, <code>DatePicker</code>, <code>Dialog</code>, <code>Icon</code>,
		<code>Input</code>, <code>Segmented</code>, <code>Switch</code> and <code>TimeRangeField</code>
		components it uses, with <code>announce.ts</code>, <code>now.svelte.ts</code> and
		<code>tokens.css</code>. Dates use <code>@internationalized/date</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="term"
	title="A term's timetable"
	description="Drag across an empty stretch of the week to add an event, drag one to move it, or pull its bottom edge to change its length. Changes are kept in this browser."
	{...ex('term')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>events</code></td><td><code>CalendarEvent[]</code> (bindable)</td><td>required</td
			></tr
		>
		<tr
			><td><code>calendars</code></td><td><code>{'{ id, name, color }[]'}</code></td><td
				>required</td
			></tr
		>
		<tr
			><td><code>view</code></td><td><code>'month' | 'week' | 'day'</code> (bindable)</td><td
				><code>'week'</code></td
			></tr
		>
		<tr><td><code>date</code></td><td><code>CalendarDate</code> (bindable)</td><td>today</td></tr>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>
<p>
	An event is <code>{'{ id, title, calendar, start, end, allDay? }'}</code>, with
	<code>start</code> and <code>end</code> as <code>CalendarDateTime</code>.
</p>

<h2 id="keyboard">Keyboard</h2>
<ul>
	<li>New event opens the event form; every event is a button that opens it for editing.</li>
	<li>Date and time are set in the form, so nothing needs a pointer.</li>
	<li>Each day's heading, or its number in the month, opens that day.</li>
</ul>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Events are read with their title, time and calendar.</li>
	<li>Adding, saving, moving and deleting are announced.</li>
	<li>The heading announces the range as you page through it.</li>
	<li>With reduced motion, views change without sliding.</li>
</ul>
