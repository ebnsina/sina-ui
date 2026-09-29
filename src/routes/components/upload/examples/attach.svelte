<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale } from 'svelte/transition';
	import { Attachment01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Textarea from '#lib/ui/Textarea.svelte';
	import { createUploads } from '#lib/ui/uploads.svelte.js';
	import { pretendSend } from './pretend-send';

	const uploads = createUploads(pretendSend);
	const size = new Intl.NumberFormat('en', {
		style: 'unit',
		unit: 'kilobyte',
		notation: 'compact',
		maximumFractionDigits: 1
	});
	let input: HTMLInputElement;
</script>

<!-- Attachments on a message: a button, and a chip per file with its progress along the bottom. -->
<div class="compose">
	<Textarea
		label="Message to the librarian"
		rows={3}
		placeholder="Here are the scans I mentioned…"
	/>
	<ul class="chips" aria-label="Attachments">
		{#each uploads.items as u (u.id)}
			<li
				class={['chip', u.status]}
				animate:flip={{
					duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200
				}}
				out:scale={{
					start: 0.9,
					duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160
				}}
			>
				<span class="file">{u.file.name}</span>
				<span class="meta">
					{u.status === 'failed' ? 'Failed' : size.format(u.file.size / 1000)}
				</span>
				{#if u.status === 'failed'}
					<button type="button" class="retry" onclick={() => uploads.retry(u.id)}>Retry</button>
				{/if}
				<button
					type="button"
					class="x"
					aria-label="Remove {u.file.name}"
					onclick={() => uploads.remove(u.id)}
					><Icon icon={Cancel01Icon} size={12} strokeWidth={2.5} /></button
				>
				{#if u.status === 'uploading'}
					<span class="bar" style:transform="scaleX({u.progress})" aria-hidden="true"></span>
				{/if}
			</li>
		{/each}
	</ul>
	<div class="row">
		<Button variant="ghost" size="sm" onclick={() => input.click()}>
			<Icon icon={Attachment01Icon} size={16} /> Attach files
		</Button>
		<Button size="sm" disabled={uploads.active > 0}>{uploads.active ? 'Uploading…' : 'Send'}</Button
		>
	</div>
	<input
		bind:this={input}
		type="file"
		multiple
		hidden
		onchange={(e) => {
			if (e.currentTarget.files) uploads.add(e.currentTarget.files);
			e.currentTarget.value = '';
		}}
	/>
</div>

<style>
	.compose {
		display: grid;
		/* minmax(0): a long file name ellipsizes in its chip instead of widening the form. */
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
		inline-size: min(28rem, 100%);
	}
	/* Stays in the page while the last chip leaves, then takes no room. */
	.chips:empty {
		display: none;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.chip {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		max-inline-size: 100%;
		padding-block: 0.375rem;
		padding-inline: 0.75rem 0.375rem;
		overflow: hidden;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		font-size: 0.8125rem;
		animation: in 200ms var(--ui-ease-out);
	}
	@keyframes in {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
	}
	.chip.failed {
		background: color-mix(in srgb, var(--ui-danger) 10%, transparent);
	}
	.file {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.meta {
		flex: none;
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
	}
	.failed .meta {
		color: var(--ui-danger);
	}
	.retry {
		padding: 0;
		border: 0;
		background: none;
		color: var(--ui-fg);
		font: 600 0.8125rem/1 var(--ui-font);
		text-decoration: underline;
		cursor: pointer;
	}
	.x {
		display: grid;
		flex: none;
		place-items: center;
		inline-size: 1.25rem;
		block-size: 1.25rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--ui-muted);
		cursor: pointer;
	}
	.x:hover {
		background: var(--ui-hover);
		color: var(--ui-fg);
	}
	:is(.x, .retry):focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 1px;
	}
	/* Progress as a hairline along the chip's bottom edge. */
	.bar {
		position: absolute;
		inset: auto 0 0;
		block-size: 2px;
		background: var(--ui-accent);
		transform-origin: left;
		transition: transform 200ms linear;
	}
	.row {
		display: flex;
		justify-content: space-between;
	}
	@media (prefers-reduced-motion: reduce) {
		.chip {
			animation: none;
		}
	}
</style>
