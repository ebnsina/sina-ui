<script lang="ts">
	import { pop, reflow } from './motion';
	import {
		Cancel01Icon,
		CheckmarkCircle02Icon,
		File02Icon,
		RefreshIcon
	} from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Tooltip from './Tooltip.svelte';
	import type { Uploads } from './uploads.svelte';

	interface Props {
		uploads: Uploads;
		/** Tighter rows, for the floating tray. */
		compact?: boolean;
		locale?: string;
	}

	let { uploads, compact = false, locale = 'en' }: Props = $props();

	const size = (bytes: number) => {
		const [n, unit] =
			bytes >= 1e6
				? [bytes / 1e6, 'megabyte']
				: bytes >= 1e3
					? [bytes / 1e3, 'kilobyte']
					: [bytes, 'byte'];
		return new Intl.NumberFormat(locale, { style: 'unit', unit, maximumFractionDigits: 1 }).format(
			n
		);
	};
	// Plain tabular digits, not rolling ones: progress changes several times a second, faster than a
	// roll can finish. The bar carries the motion.
	const percent = $derived(new Intl.NumberFormat(locale, { style: 'percent' }));

	// Names cut short with "…" show in full on hover. Screen readers already read the whole name.
	let cut = $state<Record<number, boolean>>({});
	const watch = (id: number) => (node: HTMLElement) => {
		const check = () => (cut[id] = node.scrollWidth > node.clientWidth);
		check();
		const seen = new ResizeObserver(check);
		seen.observe(node);
		return () => seen.disconnect();
	};
</script>

<ul class={['uploads', compact && 'compact']}>
	{#each uploads.items as u (u.id)}
		<li
			class={u.status}
			out:pop={{ start: 0.96, duration: 200 }}
			animate:reflow={{ duration: 250 }}
		>
			<span class="icon" aria-hidden="true">
				{#if u.status === 'done'}
					<span class="tick"><Icon icon={CheckmarkCircle02Icon} size={18} /></span>
				{:else}
					<Icon icon={File02Icon} size={18} />
				{/if}
			</span>
			<span class="body">
				<span class="row">
					{#if cut[u.id]}
						<Tooltip text={u.file.name}>
							{#snippet trigger(props)}
								<span
									class="name"
									{...props as HTMLAttributes<HTMLSpanElement>}
									{@attach watch(u.id)}>{u.file.name}</span
								>
							{/snippet}
						</Tooltip>
					{:else}
						<span class="name" {@attach watch(u.id)}>{u.file.name}</span>
					{/if}
					{#if u.status === 'uploading'}
						<span class="percent">{percent.format(u.progress)}</span>
					{/if}
				</span>
				<!-- The bar fills with a transform, so it stays smooth while the page is busy. -->
				<span
					class="bar"
					role="progressbar"
					aria-label="{u.file.name} upload"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(u.progress * 100)}
				>
					<span class="fill" style:--p={u.progress}></span>
				</span>
				<span class="status">
					{#if u.status === 'uploading'}
						{size(u.progress * u.file.size)} of {size(u.file.size)}
					{:else if u.status === 'done'}
						{size(u.file.size)} · Uploaded
					{:else if u.status === 'failed'}
						{u.error}
					{:else}
						Canceled
					{/if}
				</span>
			</span>
			<span class="actions">
				{#if u.status === 'uploading'}
					<button
						type="button"
						aria-label="Cancel {u.file.name}"
						onclick={() => uploads.cancel(u.id)}
					>
						<Icon icon={Cancel01Icon} size={16} />
					</button>
				{:else}
					{#if u.status === 'failed' || u.status === 'canceled'}
						<button
							type="button"
							aria-label="Retry {u.file.name}"
							onclick={() => uploads.retry(u.id)}
						>
							<Icon icon={RefreshIcon} size={16} />
						</button>
					{/if}
					<button
						type="button"
						aria-label="Remove {u.file.name}"
						onclick={() => uploads.remove(u.id)}
					>
						<Icon icon={Cancel01Icon} size={16} />
					</button>
				{/if}
			</span>
		</li>
	{/each}
</ul>

<style>
	.uploads:not(:has(li)) {
		display: none;
	}
	.uploads {
		display: grid;
		/* Capped at the list's width: a long file name shortens with "…" instead of widening it. */
		grid-template-columns: minmax(0, 1fr);
		gap: 0.375rem;
		margin: 0;
		padding: 0;
		list-style: none;
		color: var(--ui-fg);
		font: 0.875rem/1.4 var(--ui-font);
	}
	li {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding-block: 0.625rem;
		padding-inline: 0.75rem 0.5rem;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		transition:
			opacity var(--ui-dur-overlay) var(--ui-ease-out),
			translate var(--ui-dur-overlay) var(--ui-ease-out);
	}
	@starting-style {
		li {
			opacity: 0;
			translate: 0 -4px;
		}
	}
	.compact li {
		padding-block: 0.5rem;
		background: none;
	}
	.icon {
		display: grid;
		padding-block-start: 0.125rem;
		color: var(--ui-muted);
	}
	.done .icon {
		color: var(--ui-accent);
	}
	.failed .icon {
		color: var(--ui-danger);
	}
	/* The tick pops in when an upload finishes. */
	.tick {
		display: grid;
		transition: scale var(--ui-dur-overlay) var(--ui-ease-out);
	}
	@starting-style {
		.tick {
			scale: 0.5;
		}
	}
	.body {
		display: grid;
		flex: 1;
		gap: 0.3125rem;
		min-inline-size: 0;
	}
	.row {
		display: flex;
		gap: 0.5rem;
	}
	.name {
		flex: 1;
		min-inline-size: 0;
		overflow: hidden;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.percent {
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
	}
	.bar {
		display: block;
		block-size: 4px;
		overflow: hidden;
		border-radius: 2px;
		background: var(--ui-hover);
	}
	.fill {
		display: block;
		block-size: 100%;
		background: var(--ui-accent);
		transform: scaleX(var(--p));
		transform-origin: left;
		transition:
			transform 300ms var(--ui-ease-out),
			background-color var(--ui-dur) ease;
	}
	.fill:dir(rtl) {
		transform-origin: right;
	}
	.failed .fill {
		background: var(--ui-danger);
	}
	.canceled .fill {
		background: var(--ui-muted);
	}
	.status {
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
	}
	.failed .status {
		color: var(--ui-danger);
	}
	.actions {
		display: flex;
		flex: none;
	}
	.actions button {
		display: grid;
		place-items: center;
		inline-size: 2rem;
		block-size: 2rem;
		margin: 0;
		padding: 0;
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) - 0.125rem);
		background: none;
		color: var(--ui-muted);
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			color var(--ui-dur) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (pointer: coarse) {
		.actions button {
			inline-size: 2.75rem;
			block-size: 2.75rem;
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.actions button:hover {
			background: var(--ui-hover);
			color: var(--ui-fg);
		}
	}
	.actions button:active {
		transform: scale(0.92);
	}
	.actions button:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 0;
	}
	@media (prefers-reduced-motion: reduce) {
		li,
		.tick,
		.fill {
			transition: none;
		}
	}
</style>
