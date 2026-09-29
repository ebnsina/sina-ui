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
		content="A month grid for choosing a day or a range, in any calendar system."
	/>
	<meta property="og:title" content="Calendar — Sina UI" />
	<meta
		property="og:description"
		content="A month grid for choosing a day or a range, in any calendar system."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Calendar</h1>
<p class="lede">
	A month grid for choosing a day or a range of days. Shows the Hijri, Persian or any other calendar
	while storing ordinary dates.
</p>

<h2 id="installation">Installation</h2>
<Install names="calendar">
	<p>
		Copy <code>src/lib/ui/Calendar.svelte</code>, <code>Button.svelte</code>,
		<code>Icon.svelte</code>, <code>announce.ts</code> and <code>tokens.css</code>. Dates use
		<code>@internationalized/date</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="single"
	title="One day"
	description="Fridays can't be chosen here: pass isUnavailable for closed days."
	{...ex('single')}
/>
<Example
	id="range"
	title="A range, two months"
	description="Choose a first day, then a last; the days between fill in as you point."
	{...ex('range')}
/>
<Example
	id="hijri"
	title="In the Hijri calendar"
	description="The grid shows Hijri months and days; what you get back is the Gregorian date."
	{...ex('hijri')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code></td><td>required</td></tr>
		<tr><td><code>value</code></td><td><code>CalendarDate</code> (bindable)</td><td></td></tr>
		<tr
			><td><code>mode</code></td><td><code>'single' | 'range'</code></td><td
				><code>'single'</code></td
			></tr
		>
		<tr><td><code>range</code></td><td><code>{'{ start, end }'}</code> (bindable)</td><td></td></tr>
		<tr><td><code>months</code></td><td><code>number</code></td><td><code>1</code></td></tr>
		<tr
			><td><code>calendar</code></td><td
				><code>string</code>, such as <code>'islamic-umalqura'</code></td
			><td><code>'gregory'</code></td></tr
		>
		<tr
			><td><code>min</code>, <code>max</code>, <code>isUnavailable</code></td><td>limits</td><td
			></td></tr
		>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		A grid: arrow keys move by day and week, Page Up and Page Down by month (with Shift, by year),
		Home and End to the week's ends.
	</li>
	<li>Unavailable days are announced as such and can't be chosen.</li>
	<li>Changing month is announced.</li>
</ul>
