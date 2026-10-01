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
	<title>Alert — Sina UI</title>
	<meta
		name="description"
		content="Inline messages with a tone, optional actions and dismiss, announced only when they should be."
	/>
	<meta property="og:title" content="Alert — Sina UI" />
	<meta
		property="og:description"
		content="Inline messages with a tone, optional actions and dismiss, announced only when they should be."
	/>
</svelte:head>

<p class="eyebrow">Feedback</p>
<h1>Alert</h1>
<p class="lede">A message about the page or a result, shown in place.</p>

<h2 id="installation">Installation</h2>
<Install names="alert">
	<p>
		Copy <code>src/lib/ui/Alert.svelte</code>, <code>Icon.svelte</code> and <code>tokens.css</code>.
		Icons come from <code>@hugeicons/core-free-icons</code>.
	</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="info"
	title="Info"
	description="The default, for news worth knowing."
	stack
	{...ex('info')}
/>
<Example
	id="success"
	title="Success"
	description="When something worked."
	stack
	{...ex('success')}
/>
<Example
	id="warning"
	title="Warning"
	description="When something needs attention soon."
	stack
	{...ex('warning')}
/>
<Example
	id="danger"
	title="Danger"
	description="When something went wrong or can't be undone."
	stack
	{...ex('danger')}
/>
<Example id="actions" title="Actions and dismiss" stack {...ex('actions')} />
<Example
	id="live"
	title="Announced results"
	stack
	description="With live, it is read out as it appears: status politely, danger as an alert."
	{...ex('live')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr
			><td><code>tone</code></td><td><code>'info' | 'success' | 'warning' | 'danger'</code></td><td
				><code>'info'</code></td
			></tr
		>
		<tr><td><code>title</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr
			><td><code>live</code></td><td><code>boolean</code>: announce on appearance</td><td
				><code>false</code></td
			></tr
		>
		<tr
			><td><code>ondismiss</code></td><td><code>() =&gt; void</code>: shows a close button</td><td
			></td></tr
		>
		<tr><td><code>actions</code></td><td>Snippet</td><td></td></tr>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>
		Static by default: it is simply read in page order, like any text. Only <code>live</code> alerts are
		announced, so screen readers are not flooded on page load.
	</li>
	<li>Tone is in the icon and the words, never color alone.</li>
	<li>The close button is named (translate <code>dismissLabel</code>).</li>
</ul>
