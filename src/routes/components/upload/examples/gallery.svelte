<script lang="ts">
	import { Cancel01Icon, ImageAdd01Icon } from '@hugeicons/core-free-icons';
	import Icon from '#lib/ui/Icon.svelte';
	import Sortable from '#lib/ui/Sortable.svelte';
	import { createUploads } from '#lib/ui/uploads.svelte.js';
	import { pretendSend } from './pretend-send';

	const uploads = createUploads(pretendSend);
	// Previews by upload id, made once per file.
	const previews = new Map<number, string>();
	const preview = (id: number, file: File) =>
		previews.get(id) ?? previews.set(id, URL.createObjectURL(file)).get(id)!;
	let input: HTMLInputElement;
	let dragging = $state(false);

	const add = (files: FileList | null | undefined) =>
		files && uploads.add([...files].filter((f) => f.type.startsWith('image/')));
</script>

<!-- Drop images anywhere on the gallery; drag tiles to put them in order. -->
<div
	class={['gallery', dragging && 'over']}
	role="group"
	aria-label="Gallery"
	ondragover={(e) => {
		if (!e.dataTransfer?.types.includes('Files')) return;
		e.preventDefault();
		dragging = true;
	}}
	ondragleave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && (dragging = false)}
	ondrop={(e) => {
		e.preventDefault();
		dragging = false;
		add(e.dataTransfer?.files);
	}}
>
	<Sortable
		bind:items={() => uploads.items, (next) => uploads.items.splice(0, Infinity, ...next)}
		key={(u) => u.id}
		itemLabel={(u) => u.file.name}
		label="Photos, in order"
		layout="grid"
		class="tiles"
	>
		{#snippet children(u, handle)}
			<div class="tile">
				<button type="button" class="image" data-sortable-item {...handle}>
					<img src={preview(u.id, u.file)} alt="" />
				</button>
				{#if u.status === 'uploading'}
					<!-- A ring fills as it uploads; transform-only, so it stays smooth. -->
					<svg class="ring" viewBox="0 0 36 36" aria-hidden="true">
						<circle
							cx="18"
							cy="18"
							r="15"
							pathLength="1"
							style:stroke-dashoffset={1 - u.progress}
						/>
					</svg>
				{:else if u.status === 'failed'}
					<button type="button" class="failed" onclick={() => uploads.retry(u.id)}>Retry</button>
				{/if}
				<button
					type="button"
					class="remove"
					aria-label="Remove {u.file.name}"
					onclick={() => {
						const url = previews.get(u.id);
						uploads.remove(u.id);
						// Freed after the tile has faded out, so it doesn't blank mid-exit.
						setTimeout(() => url && URL.revokeObjectURL(url), 400);
					}}><Icon icon={Cancel01Icon} size={12} strokeWidth={2.5} /></button
				>
			</div>
		{/snippet}
	</Sortable>
	<button type="button" class="add" onclick={() => input.click()}>
		<Icon icon={ImageAdd01Icon} size={22} />
		<span>Add photos</span>
	</button>
	<input
		bind:this={input}
		type="file"
		accept="image/*"
		multiple
		hidden
		onchange={(e) => {
			add(e.currentTarget.files);
			e.currentTarget.value = '';
		}}
	/>
</div>

<style>
	.gallery {
		display: grid;
		gap: 0.5rem;
		inline-size: min(28rem, 100%);
		padding: 0.5rem;
		border-radius: 1.25rem;
		transition: background var(--ui-dur) ease;
	}
	.over {
		background: color-mix(in srgb, var(--ui-accent) 10%, transparent);
	}
	.gallery :global(.tiles) {
		--sortable-columns: 3;
	}
	.tile {
		position: relative;
		aspect-ratio: 1;
	}
	.image {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		padding: 0;
		overflow: hidden;
		border: 0;
		border-radius: 0.75rem;
		background: var(--ui-subtle);
	}
	.image img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		pointer-events: none;
	}
	.image:focus-visible,
	.remove:focus-visible,
	.add:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.ring {
		position: absolute;
		inset: 50% auto auto 50%;
		inline-size: 2.5rem;
		translate: -50% -50%;
		rotate: -90deg;
		pointer-events: none;
	}
	.ring circle {
		fill: rgb(0 0 0 / 0.35);
		stroke: #fff;
		stroke-width: 3;
		stroke-dasharray: 1;
		transition: stroke-dashoffset 200ms linear;
	}
	.failed {
		position: absolute;
		inset: auto 0.375rem 0.375rem;
		padding: 0.25rem;
		border: 0;
		border-radius: 0.5rem;
		background: var(--ui-danger);
		color: var(--ui-on-danger);
		font: 600 0.75rem/1.2 var(--ui-font);
		cursor: pointer;
	}
	.remove {
		position: absolute;
		inset-block-start: -0.375rem;
		inset-inline-end: -0.375rem;
		display: grid;
		place-items: center;
		inline-size: 1.375rem;
		block-size: 1.375rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--ui-fg);
		color: var(--ui-surface);
		cursor: pointer;
	}
	.add {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		block-size: 3rem;
		border: 0;
		border-radius: 0.75rem;
		background: var(--ui-subtle);
		color: var(--ui-muted);
		font: 500 0.875rem/1 var(--ui-font);
		cursor: pointer;
		transition: background var(--ui-dur) ease;
	}
	.add:hover {
		background: var(--ui-hover);
		color: var(--ui-fg);
	}
</style>
