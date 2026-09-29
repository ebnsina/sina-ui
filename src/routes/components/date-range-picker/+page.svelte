<script lang="ts">
	import { resolve } from '$app/paths';
	import Install from '#lib/site/Install.svelte';
	import type { Component } from 'svelte';
	import Code from '#lib/site/Code.svelte';
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
	<title>Date range picker — Sina UI</title>
	<meta
		name="description"
		content="Choose a start and an end date from a calendar, with quick picks."
	/>
	<meta property="og:title" content="Date range picker — Sina UI" />
	<meta
		property="og:description"
		content="Choose a start and an end date from a calendar, with quick picks."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Date range picker</h1>
<p class="lede">
	Choose a start and an end day: two months at a glance, with quick picks for common spans.
</p>

<h2 id="installation">Installation</h2>
<Install names="date-range-picker">
	<p>
		Copy <code>src/lib/ui/DateRangePicker.svelte</code>, <code>Calendar.svelte</code>,
		<code>Popover.svelte</code>, <code>floating.ts</code>, <code>announce.ts</code>,
		<code>Button.svelte</code>, <code>Icon.svelte</code> and <code>tokens.css</code>, then install
		its date library:
	</p>
	<Code code="pnpm add @internationalized/date" lang="shell" label="Install command" />
	<p>
		The value is <code>{'{'} start, end {'}'}</code>, two <code>CalendarDate</code>s. For one day,
		use the <a href={resolve('/components/date-picker')}>Date picker</a>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="With quick picks"
	stack
	description="Choose the first day, then the last; the span follows the pointer in between."
	{...ex('basic')}
/>
<Example
	id="unavailable"
	title="Closed days"
	stack
	description="A range can't run across a day that's unavailable, so days beyond the next closed one can't end it."
	{...ex('unavailable')}
/>
<Example
	id="inline"
	title="On the page"
	stack
	description="The calendar on its own, in range mode, showing two months."
	{...ex('inline')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>value</code></td><td><code>{'{'} start, end {'}'}</code>, bindable</td><td
			></td></tr
		>
		<tr
			><td><code>presets</code></td><td><code>{'{'} label, start, end {'}'}[]</code></td><td
			></td></tr
		>
		<tr><td><code>months</code></td><td><code>number</code></td><td><code>2</code></td></tr>
		<tr><td><code>min</code>, <code>max</code></td><td><code>CalendarDate</code></td><td></td></tr>
		<tr><td><code>isUnavailable</code></td><td><code>(date) =&gt; boolean</code></td><td></td></tr>
		<tr
			><td><code>startName</code>, <code>endName</code></td><td
				><code>string</code>: hidden inputs for forms</td
			><td></td></tr
		>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
		<tr
			><td><code>calendar</code></td><td><code>string | CustomCalendar</code></td><td
				><code>'gregory'</code></td
			></tr
		>
		<tr><td><code>hint</code>, <code>error</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td>Arrow keys</td><td>Move by day or week, across into the next month</td></tr>
		<tr><td>Page Up / Page Down</td><td>Previous or next month (with Shift, year)</td></tr>
		<tr><td>Enter / Space</td><td>Choose the start, then the end</td></tr>
		<tr><td>Escape</td><td>Drop a half-chosen range; press again to close</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Each month is a grid; every day in the range is marked selected.</li>
	<li>
		After the first day, screen readers hear that it’s the start and that the end comes next; once
		both are chosen, the whole range is read out.
	</li>
	<li>The popover opens on the chosen start day (or today), ready for the arrow keys.</li>
</ul>
