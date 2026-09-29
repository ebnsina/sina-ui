<script lang="ts">
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
	<title>Date picker — Sina UI</title>
	<meta
		name="description"
		content="A date field with a calendar that works by keyboard, touch and screen reader, in any locale."
	/>
	<meta property="og:title" content="Date picker — Sina UI" />
	<meta
		property="og:description"
		content="A date field with a calendar that works by keyboard, touch and screen reader, in any locale."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Date picker</h1>
<p class="lede">Chooses a date from a calendar, in any locale and direction.</p>

<h2 id="installation">Installation</h2>
<Install names="date-picker">
	<p>
		Copy <code>src/lib/ui/DatePicker.svelte</code>, <code>Calendar.svelte</code>,
		<code>Popover.svelte</code>, <code>floating.ts</code>, <code>announce.ts</code>,
		<code>Button.svelte</code>, <code>Icon.svelte</code> and <code>tokens.css</code>, then install
		its date library:
	</p>
	<Code code="pnpm add @internationalized/date" lang="shell" label="Install command" />
	<p>Values are <code>CalendarDate</code>s from that library: a day, with no time or time zone.</p>
	<p>
		For dates typed in words, also copy <code>NaturalDate.svelte</code> and
		<code>parse-date.ts</code>
		(English and Bangla). For the Bangla calendar, copy <code>calendars/bangla.ts</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Date picker"
	stack
	description="Opens on the chosen day, or today. Days outside the range or unavailable are crossed out and can't be chosen. With a name, a hidden input submits the date as YYYY-MM-DD."
	{...ex('basic')}
/>
<Example
	id="natural"
	title="Typed in words"
	stack
	description="Type “tomorrow”, “next friday”, “in 2 weeks”, “15 june” or 2026-10-02, or click an example to type it in: what it means shows underneath, and Enter or leaving the field takes it. The calendar button is still there for picking."
	{...ex('natural')}
/>
<Example id="error" title="With an error" stack {...ex('error')} />
<Example
	id="calendar"
	title="Calendar on its own"
	description="For a page where the calendar is the main thing, like booking a visit."
	{...ex('calendar')}
/>
<Example
	id="arabic"
	title="Hijri calendar"
	stack
	description="Arabic, right to left, in the Umm al-Qura Hijri calendar: Hijri months and years, Arabic names and digits, arrow keys following the direction. The value stays a Gregorian date."
	{...ex('arabic')}
/>
<Example
	id="bangla"
	title="Bangla calendar"
	stack
	description="বৈশাখ to চৈত্র with Bangla digits, as Bangladesh keeps its calendar (not West Bengal's). Pass bangla from calendars/bangla.ts as the calendar; the value stays a Gregorian date."
	{...ex('bangla')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>value</code></td><td><code>CalendarDate</code>, bindable</td><td></td></tr>
		<tr><td><code>min</code>, <code>max</code></td><td><code>CalendarDate</code></td><td></td></tr>
		<tr>
			<td><code>isUnavailable</code></td><td><code>(date) =&gt; boolean</code></td><td></td>
		</tr>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
		<tr>
			<td><code>calendar</code></td><td
				><code>'gregory' | 'islamic-umalqura' | 'persian' | …</code></td
			><td><code>'gregory'</code></td>
		</tr>
		<tr><td><code>name</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>placeholder</code>, <code>hint</code>, <code>error</code></td><td
				><code>string</code></td
			><td></td></tr
		>
	</tbody>
</table>
<p>
	Calendar takes the same <code>value</code>, <code>label</code>, <code>locale</code>,
	<code>min</code>, <code>max</code> and <code>isUnavailable</code>, plus <code>onchange</code>.
</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The calendar is a grid with one Tab stop: arrow keys move between days, and each day is read in
		full (“Saturday, 14 June 2025, today”).
	</li>
	<li>
		Changing month is announced, and today is marked by a dot as well as by name, not by colour
		alone.
	</li>
	<li>Choosing a date closes the picker and puts focus back on it.</li>
</ul>
<table>
	<thead><tr><th>Key</th><th>Action</th></tr></thead>
	<tbody>
		<tr><td><kbd>←</kbd> <kbd>→</kbd></td><td>Previous / next day (mirrored right to left).</td></tr
		>
		<tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Same day, previous / next week.</td></tr>
		<tr
			><td><kbd>Page Up</kbd> <kbd>Page Down</kbd></td><td
				>Previous / next month; with <kbd>Shift</kbd>, year.</td
			></tr
		>
		<tr><td><kbd>Home</kbd> <kbd>End</kbd></td><td>Start / end of the week.</td></tr>
		<tr><td><kbd>Enter</kbd> <kbd>Space</kbd></td><td>Choose the day.</td></tr>
		<tr><td><kbd>Esc</kbd></td><td>Close without choosing.</td></tr>
	</tbody>
</table>
