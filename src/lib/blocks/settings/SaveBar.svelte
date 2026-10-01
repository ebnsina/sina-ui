<script lang="ts">
	import Button from '#lib/ui/Button.svelte';

	interface Props {
		dirty: boolean;
		saving: boolean;
		error?: string;
		onsave: () => void;
		ondiscard: () => void;
	}
	let { dirty, saving, error, onsave, ondiscard }: Props = $props();
</script>

<!-- Slides up only while something has changed; hidden otherwise (inert, so Tab skips it). -->
<div
	class={['savebar', dirty && 'shown']}
	inert={!dirty}
	role="region"
	aria-label="Unsaved changes"
>
	<p class={['note', error && 'error']} aria-live="polite">{error ?? 'Unsaved changes'}</p>
	<Button variant="ghost" size="sm" onclick={ondiscard} disabled={saving}>Discard</Button>
	<Button size="sm" loading={saving} onclick={onsave}>Save</Button>
</div>

<style>
	.savebar {
		position: sticky;
		inset-block-end: 0.75rem;
		z-index: 2;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-block-start: 1.25rem;
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		border: 1px solid transparent;
		border-radius: var(--ui-radius);
		background: var(--ui-surface-overlay);
		box-shadow: var(--ui-shadow-overlay);
		opacity: 0;
		translate: 0 0.75rem;
		visibility: hidden;
		transition:
			opacity var(--ui-dur-exit) ease,
			translate var(--ui-dur-exit) ease,
			visibility 0s var(--ui-dur-exit);
	}
	.shown {
		opacity: 1;
		translate: 0 0;
		visibility: visible;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			translate var(--ui-dur-spring) var(--ui-ease-spring),
			visibility 0s;
	}
	.note {
		flex: 1;
		min-inline-size: 0;
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
	/* "Unsaved changes" stays on one line; an error may wrap, it must be read in full. */
	.note:not(.error) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.error {
		color: var(--ui-danger);
	}
	@media (prefers-reduced-motion: reduce) {
		.savebar,
		.shown {
			translate: 0 0;
		}
	}
</style>
