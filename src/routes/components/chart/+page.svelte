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
	<title>Chart — Sina UI</title>
	<meta
		name="description"
		content="Accessible charts on TanStack Charts, themed by Sina UI tokens in light and dark."
	/>
	<meta property="og:title" content="Chart — Sina UI" />
	<meta
		property="og:description"
		content="Accessible charts on TanStack Charts, themed by Sina UI tokens in light and dark."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Chart</h1>
<p class="lede">Shows numbers as a picture, with a title and a one-line takeaway.</p>

<h2 id="installation">Installation</h2>
<Install names="chart">
	<p>
		Copy <code>src/lib/ui/Chart.svelte</code> and <code>tokens.css</code>, then install TanStack
		Charts:
	</p>
	<Code code="pnpm add -E @tanstack/charts@0.18.0" lang="shell" label="Install command" />
	<p>
		The exact version is pinned: TanStack Charts is before 1.0, so a new minor version may change
		its API. Check its release notes before upgrading.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<p>
	Each chart draws itself in the first time it's scrolled into view. Focus one and use the arrow
	keys to read it point by point; hovering shows the same tooltips.
</p>
<Example id="area" title="Area" description="Stacked series, with a legend." {...ex('area')} />
<Example id="bar" title="Bar" {...ex('bar')} />
<Example
	id="lines"
	title="Line"
	description="Series take their colors from the theme, in order, in light and dark."
	{...ex('lines')}
/>
<Example id="pie" title="Pie" description="A donut, with the total in the middle." {...ex('pie')} />
<Example
	id="radar"
	title="Radar"
	description="One value per direction, on a polygon grid."
	{...ex('radar')}
/>
<Example id="radial" title="Radial" description="Bars around a circle." {...ex('radial')} />
<Example
	id="tooltip"
	title="Custom tooltip"
	description="Your own tooltip content, here with a second value the bars don't show."
	{...ex('tooltip')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>title</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>description</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>definition</code></td><td>a TanStack Charts <code>defineChart(…)</code></td><td
			></td></tr
		>
		<tr
			><td><code>aspectRatio</code></td><td><code>number</code></td><td><code>16 / 9</code></td></tr
		>
		<tr><td><code>height</code></td><td><code>number</code> (px)</td><td></td></tr>
		<tr
			><td><code>center</code></td><td><code>Snippet</code>: shown in the middle of the plot</td><td
			></td></tr
		>
		<tr
			><td><code>tooltipBody</code></td><td><code>Snippet</code>: your own tooltip content</td><td
			></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		The chart is named by its title and described by its description, both also shown on screen.
	</li>
	<li>
		It can be focused and read point by point with the arrow keys; each point shows its tooltip.
	</li>
	<li>Its space is reserved before it draws, so the page doesn't shift.</li>
	<li>Say what the chart shows in the description: not everyone can see the picture.</li>
</ul>
