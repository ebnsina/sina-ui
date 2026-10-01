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
	<title>Time field — Sina UI</title>
	<meta name="description" content="A time of day, typed part by part in the local format." />
	<meta property="og:title" content="Time field — Sina UI" />
	<meta
		property="og:description"
		content="A time of day, typed part by part in the local format."
	/>
</svelte:head>

<p class="eyebrow">Forms</p>
<h1>Time field</h1>
<p class="lede">
	A time of day: typed hour then minute, or chosen from a list. Written the way your reader’s clock
	writes it.
</p>

<h2 id="installation">Installation</h2>
<Install names="time-field time-range-field">
	<p>
		Copy <code>src/lib/ui/TimeField.svelte</code>, <code>floating.ts</code>,
		<code>Icon.svelte</code>
		and
		<code>tokens.css</code>, then install its date library:
	</p>
	<Code code="pnpm add @internationalized/date" lang="shell" label="Install command" />
	<p>The value is a <code>Time</code> from that library: hours, minutes and seconds, no date.</p>
	<p>
		For a start and an end, also copy <code>TimeRangeField.svelte</code>; its value is
		<code>{'{'} start, end }</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="basic"
	title="Basic"
	stack
	description="Type 930 and a for 9:30 AM; each part moves on to the next when it’s full. Arrow keys step through values."
	{...ex('basic')}
/>
<Example
	id="hours"
	title="A start and an end"
	stack
	description="TimeRangeField: one box for both times. Choose a start from the clock’s list and the end’s list follows, showing how long each option runs. Moving the start carries the end with it."
	{...ex('hours')}
/>
<Example id="seconds" title="24 hours, with seconds" stack {...ex('seconds')} />
<Example
	id="arabic"
	title="In Arabic"
	stack
	description="The order, the digits and the words for morning and evening all follow the locale."
	{...ex('arabic')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>label</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>value</code></td><td><code>Time</code>, bindable</td><td></td></tr>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
		<tr
			><td><code>granularity</code></td><td><code>'minute' | 'second'</code></td><td
				><code>'minute'</code></td
			></tr
		>
		<tr
			><td><code>hourCycle</code></td><td><code>12 | 24</code>: overrides the locale</td><td
			></td></tr
		>
		<tr
			><td><code>listStep</code></td><td><code>number</code>: minutes between times in the list</td
			><td>30, or <code>minuteStep</code> if larger</td></tr
		>
		<tr><td><code>minuteStep</code></td><td><code>number</code></td><td><code>1</code></td></tr>
		<tr
			><td><code>name</code></td><td><code>string</code>: a hidden input with HH:MM</td><td
			></td></tr
		>
		<tr><td><code>hint</code>, <code>error</code></td><td><code>string</code></td><td></td></tr>
		<tr><td><code>disabled</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
	</tbody>
</table>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td>0–9</td><td>Fill the part; moves on when no other digit could follow</td></tr>
		<tr><td>A / P</td><td>Morning or afternoon</td></tr>
		<tr><td>Arrow Up / Down</td><td>Next or previous value (wraps around)</td></tr>
		<tr><td>Page Up / Page Down</td><td>Hours by 2, minutes by 15</td></tr>
		<tr><td>Home / End</td><td>Lowest or highest value</td></tr>
		<tr><td>Arrow Left / Right</td><td>Previous or next part</td></tr>
		<tr><td>Alt + Arrow Down</td><td>Open the list of times</td></tr>
		<tr><td>Backspace</td><td>Remove a digit; on an empty part, go back one</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Each part is a spin button named with the field’s label (“Lecture starts, hour”) and read with
		its value, or “Empty”.
	</li>
	<li>On phones, the number pad opens for hours and minutes.</li>
	<li>
		The clock button opens a list on the chosen time (or the next one after it); arrow keys move,
		Enter chooses, Escape returns to the field.
	</li>
	<li>The whole field has the focus ring; the part being typed into is filled in.</li>
</ul>
