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
	<title>Dashboard — Sina UI</title>
	<meta
		name="description"
		content="An analytics dashboard: headline numbers, charts, occupancy and recent activity."
	/>
	<meta property="og:title" content="Dashboard — Sina UI" />
	<meta
		property="og:description"
		content="An analytics dashboard: headline numbers, charts, occupancy and recent activity."
	/>
</svelte:head>

<p class="eyebrow">Blocks</p>
<h1>Dashboard</h1>
<p class="lede">
	A whole analytics screen: headline numbers that roll when the period changes, a trend against the
	period before, a breakdown, live occupancy and a searchable table of recent activity.
</p>

<h2 id="installation">Installation</h2>
<Install names="blocks/dashboard">
	<p>
		Copy <code>src/lib/blocks/dashboard/</code> with the components it uses: Sidebar layout, Chart, Data
		table, Meter, Segmented, Badge, Button and Rolling number. It needs TanStack Charts and TanStack Table.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="library"
	title="A library's overview"
	description="Switch the period: the numbers roll, the charts redraw and the badges say whether each change is good news. Overdue loans going up shows in red."
	{...ex('library')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>data</code></td><td><code>{'{ stats, trend, subjects, rooms, loans }'}</code></td
			><td>required</td></tr
		>
		<tr
			><td><code>range</code></td><td
				><code>string</code> (bindable): load that period's data when it changes</td
			><td><code>'30d'</code></td></tr
		>
		<tr
			><td><code>ranges</code></td><td><code>{'{ value, label }[]'}</code></td><td
				>7 days, 30 days, 12 months</td
			></tr
		>
		<tr><td><code>title</code></td><td><code>string</code></td><td><code>'Overview'</code></td></tr>
		<tr
			><td><code>onexport</code></td><td><code>() =&gt; void</code>; no Export button without it</td
			><td></td></tr
		>
		<tr><td><code>locale</code></td><td><code>string</code></td><td><code>'en'</code></td></tr>
	</tbody>
</table>
<p>
	A stat is <code>{'{ label, value, change, goodWhen?, format? }'}</code>: <code>change</code> is a
	fraction (0.12 is up 12%), and <code>goodWhen: 'down'</code> marks numbers where falling is good.
</p>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Numbers are read as whole values, and each change says which period it compares with.</li>
	<li>Charts are named and described, and can be read point by point from the keyboard.</li>
	<li>Occupancy is a meter: read as “38 of 60 seats”, colored by how full the room is.</li>
	<li>On narrow screens the sidebar becomes a menu and the panels stack.</li>
</ul>
