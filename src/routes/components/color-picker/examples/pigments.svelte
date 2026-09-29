<script lang="ts">
	import ColorPicker from '#lib/ui/ColorPicker.svelte';
	import Input from '#lib/ui/Input.svelte';

	// Pigments of manuscript illumination, approximated for the screen.
	const pigments = [
		{ color: '#1f4e9c', name: 'Lapis lazuli' },
		{ color: '#d9381e', name: 'Vermilion' },
		{ color: '#3f8f7f', name: 'Verdigris' },
		{ color: '#e8b923', name: 'Orpiment' },
		{ color: '#c9a227', name: 'Gold leaf' },
		{ color: '#3b2f6b', name: 'Indigo' },
		{ color: '#f3efe4', name: 'Lead white' },
		{ color: '#1b1a17', name: 'Carbon ink' }
	];
	let name = $state('Astronomy');
	let color = $state('#1f4e9c');

	// Dark or light text, whichever reads better on the chosen colour (WCAG relative luminance).
	const text = $derived.by(() => {
		const [r, g, b] = [1, 3, 5].map((i) => {
			const c = parseInt(color.slice(i, i + 2), 16) / 255;
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? '#111' : '#fff';
	});
</script>

<div class="editor">
	<div class="fields">
		<Input label="Collection" bind:value={name} />
		<ColorPicker label="Label colour" bind:value={color} swatches={pigments} name="color" />
	</div>
	<div class="catalogue">
		<p class="caption">How it looks in the catalogue</p>
		<div class="row">
			<span class="title">Book of Optics</span>
			<span class="tag" style:background={color} style:color={text}>{name || 'Untitled'}</span>
		</div>
		<div class="row">
			<span class="title">Al-Battani’s Zij</span>
			<span class="tag" style:background={color} style:color={text}>{name || 'Untitled'}</span>
		</div>
	</div>
</div>

<style>
	.editor {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 1.5rem;
		inline-size: min(100%, 36rem);
	}
	.fields {
		display: grid;
		align-content: start;
		gap: 1rem;
	}
	.catalogue {
		display: grid;
		align-content: start;
		gap: 0.5rem;
	}
	.caption {
		margin: 0 0 0.25rem;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
		font-size: 0.875rem;
	}
	.tag {
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
		transition:
			background-color var(--ui-dur) ease,
			color var(--ui-dur) ease;
	}
</style>
