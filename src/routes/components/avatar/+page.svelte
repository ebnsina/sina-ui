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
	<title>Avatar — Sina UI</title>
	<meta name="description" content="A person's picture, or their initials when there is none." />
	<meta property="og:title" content="Avatar — Sina UI" />
	<meta
		property="og:description"
		content="A person's picture, or their initials when there is none."
	/>
</svelte:head>

<p class="eyebrow">Display</p>
<h1>Avatar</h1>
<p class="lede">A person's picture, or their initials when there is none.</p>

<h2 id="installation">Installation</h2>
<Install names="avatar">
	<p>Copy <code>src/lib/ui/Avatar.svelte</code> and <code>tokens.css</code>. No dependencies.</p>
</Install>

<h2 id="examples">Examples</h2>
<Example
	id="initials"
	title="Initials"
	description="Initials come from the first and last words of the name."
	{...ex('initials')}
/>
<Example id="small" title="Small" description="For lists and dense rows." {...ex('small')} />
<Example id="large" title="Large" description="For profiles and headers." {...ex('large')} />
<Example
	id="image"
	title="With a picture"
	description="The picture fades in over the initials once it has loaded, so nothing pops in."
	{...ex('image')}
/>
<Example
	id="fallback"
	title="When the picture fails"
	description="A picture that can't load leaves the initials in place."
	{...ex('fallback')}
/>
<Example
	id="with-name"
	title="Next to a name"
	description="When the name is already written beside it, mark the avatar decorative so screen readers don't read the name twice."
	{...ex('with-name')}
/>

<h2 id="props">Props</h2>
<table>
	<thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
	<tbody>
		<tr><td><code>name</code></td><td><code>string</code> (required)</td><td></td></tr>
		<tr><td><code>src</code></td><td><code>string</code></td><td></td></tr>
		<tr
			><td><code>size</code></td><td><code>'sm' | 'md' | 'lg'</code></td><td><code>'md'</code></td
			></tr
		>
		<tr><td><code>decorative</code></td><td><code>boolean</code></td><td><code>false</code></td></tr
		>
	</tbody>
</table>

<h2 id="accessibility">Accessibility</h2>
<ul>
	<li>Read as an image named after the person, whether it shows a picture or initials.</li>
	<li>Initials are muted text on a tint, at 4.5:1 contrast or more in both themes.</li>
</ul>
