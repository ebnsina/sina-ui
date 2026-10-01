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
	<title>Booking — Sina UI</title>
	<meta
		name="description"
		content="Booking flows for meetings, hotel stays, restaurant tables and appointments: steps you can go back through, times in the visitor's time zone, live prices and a confirmation."
	/>
	<meta property="og:title" content="Booking — Sina UI" />
	<meta
		property="og:description"
		content="Booking flows for meetings, hotel stays, restaurant tables and appointments: steps you can go back through, times in the visitor's time zone, live prices and a confirmation."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Booking</h1>
<p class="lede">
	Four booking flows built on one set of steps: a meeting, a hotel stay, a restaurant table and an
	appointment. Going back keeps every choice, and each step checks itself before moving on.
</p>

<h2 id="examples">Examples</h2>
<Example
	id="meeting"
	title="Meeting"
	description="Choose a length, a day and a time. Times are shown in your time zone; change it and they move. Some days are fully booked, to show the jump to the next free day. Once booked, add it to your calendar."
	{...ex('meeting')}
/>

<Example
	id="hotel"
	title="Hotel stay"
	description="Dates and guests first, then the rooms free for those nights. Rooms too small for your party can't be chosen, and the total updates as you go."
	{...ex('hotel')}
/>

<Example
	id="restaurant"
	title="Restaurant table"
	description="Times show in the restaurant's own time zone, and sold-out ones stay visible. Areas that can't seat your party are switched off."
	{...ex('restaurant')}
/>

<Example
	id="appointment"
	title="Appointment"
	description="A service, a person (or anyone available), then a time that fits the service's length."
	{...ex('appointment')}
/>

<h2 id="installation">Installation</h2>
<Install names="blocks/booking">
	<p>
		Copy <code>src/lib/blocks/booking/</code>, with <code>Alert</code>, <code>Avatar</code>,
		<code>Button</code>, <code>Calendar</code>, <code>DatePicker</code>,
		<code>DateRangePicker</code>, <code>Icon</code>, <code>Input</code>, <code>NumberField</code>,
		<code>RadioCards</code>, <code>Segmented</code>, <code>Select</code>, <code>Skeleton</code>,
		<code>Stepper</code>, <code>Textarea</code>, <code>announce.ts</code>, <code>motion.ts</code>,
		<code>scroll-edges.ts</code> and <code>tokens.css</code>. Needs
		<code>@internationalized/date</code>.
	</p>
</Install>

<h2 id="data">Connecting your data</h2>
<p>
	Availability comes from <code>later()</code> and the demo rules at the end of
	<code>booking.ts</code>. Replace those calls with requests to your booking service, and each
	flow's <code>submit</code> with the call that books. A failed request shows a message with Try again;
	a failed booking keeps everything filled in.
</p>

<h2 id="keyboard">Keyboard</h2>
<table>
	<thead><tr><th>Key</th><th>Does</th></tr></thead>
	<tbody>
		<tr><td><kbd>Enter</kbd> in a field</td><td>Continue to the next step</td></tr>
		<tr><td>Arrow keys in the times</td><td>Move between free times</td></tr>
		<tr><td><kbd>Tab</kbd></td><td>Move through the fields, then Back and Continue</td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Moving to a step puts focus on its heading, so screen readers hear where they are.</li>
	<li>Times are a group of radio buttons; booked ones are skipped and named as booked.</li>
	<li>Loading, how many times are free, and a day with none are announced.</li>
	<li>If a step has a problem, focus goes to the first field that needs fixing.</li>
	<li>With reduced motion, steps change without sliding.</li>
</ul>
