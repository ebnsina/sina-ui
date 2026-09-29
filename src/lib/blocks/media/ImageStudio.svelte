<script lang="ts">
	import { Download04Icon, SparklesIcon } from '@hugeicons/core-free-icons';
	import type { ImageGenerationResult } from '@tanstack/ai';
	import {
		createGenerateImage,
		type ConnectConnectionAdapter,
		type ImageGenerateInput
	} from '@tanstack/ai-svelte';
	import { announce } from '#lib/ui/announce.js';
	import Button from '#lib/ui/Button.svelte';
	import GridReveal from '#lib/ui/GridReveal.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';
	import Textarea from '#lib/ui/Textarea.svelte';

	interface Props {
		/** fetchServerSentEvents('/api/image'), or pass a fetcher instead. */
		connection?: ConnectConnectionAdapter;
		fetcher?: (
			input: ImageGenerateInput,
			o?: { signal?: AbortSignal }
		) => Promise<ImageGenerationResult>;
		/** How many images each prompt makes. */
		count?: number;
		placeholder?: string;
		class?: string;
	}

	let { connection, fetcher, count = 2, placeholder = '', class: className }: Props = $props();

	// svelte-ignore state_referenced_locally
	const gen = createGenerateImage({
		...(connection ? { connection } : { fetcher }),
		onResult: (r) => announce(`${r.images.length} images ready`)
	});

	const SHAPES = [
		{ value: '1024x1024', label: 'Square' },
		{ value: '1536x1024', label: 'Wide' },
		{ value: '1024x1536', label: 'Tall' }
	];
	let prompt = $state('');
	let size = $state('1024x1024');
	let error = $state('');
	const aspect = $derived.by(() => {
		const [w, h] = size.split('x').map(Number);
		return w / h;
	});
	// Slots whose image has fully come in, and so can be downloaded.
	let revealed = $state<number[]>([]);

	function generate(e: SubmitEvent) {
		e.preventDefault();
		if (!prompt.trim()) {
			error = 'Describe what to draw.';
			return;
		}
		error = '';
		revealed = [];
		gen.generate({ prompt: prompt.trim(), size, numberOfImages: count });
	}
	const src = (img: ImageGenerationResult['images'][number]) =>
		img.url ?? `data:image/png;base64,${img.b64Json}`;
</script>

<section class={['studio', className]} aria-label="Image generator">
	<form onsubmit={generate}>
		<Textarea
			label="Describe the image"
			bind:value={prompt}
			{placeholder}
			rows={2}
			{error}
			oninput={() => (error = '')}
			onkeydown={(e) => {
				// ⌘/Ctrl Enter generates without leaving the field.
				if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
			}}
		/>
		<div class="row">
			<Segmented label="Shape" hideLabel options={SHAPES} bind:value={size} />
			{#if gen.isLoading}
				<Button variant="secondary" onclick={() => gen.stop()}>Stop</Button>
			{:else}
				<Button type="submit"><Icon icon={SparklesIcon} size={16} /> Generate</Button>
			{/if}
		</div>
	</form>

	<div class="results" aria-live="polite" aria-busy={gen.isLoading}>
		{#if gen.error}
			<p class="failed" role="alert">The images didn't come through. Try again in a moment.</p>
		{:else if gen.isLoading || gen.result}
			<!-- Each slot is tiles at work while drawing, then sharpens into its image where it stands. -->
			{#each { length: gen.isLoading ? count : (gen.result?.images.length ?? 0) }, i (i)}
				{@const img = gen.isLoading ? undefined : gen.result?.images[i]}
				<figure class="tile">
					<GridReveal
						src={img && src(img)}
						alt={img?.revisedPrompt ?? prompt}
						ratio={aspect}
						onrevealed={() => (revealed = [...revealed, i])}
					/>
					{#if img && revealed.includes(i)}
						<Button
							variant="secondary"
							size="sm"
							square
							class="save"
							href={src(img)}
							download="image-{i + 1}"
							aria-label="Download image {i + 1}"
						>
							<Icon icon={Download04Icon} size={16} />
						</Button>
					{/if}
				</figure>
			{/each}
		{:else}
			<p class="empty">Your images appear here.</p>
		{/if}
	</div>
</section>

<style>
	/* Concentric: 1.75rem card = 1.25rem padding + the tiles' 0.5rem. */
	.studio {
		display: grid;
		gap: 1.25rem;
		inline-size: 100%;
		box-sizing: border-box;
		padding: 1.25rem;
		border-radius: 1.75rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
	}
	form {
		display: grid;
		gap: 0.75rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	/* Wrapped under the options on a phone, the button keeps to the end as it does on one line. */
	.row > :global(.btn) {
		margin-inline-start: auto;
	}
	.results {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 0.75rem;
		min-block-size: 10rem;
	}
	.tile {
		position: relative;
		margin: 0;
		overflow: hidden;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		animation: appear 400ms var(--ui-ease-out) backwards;
	}
	.tile:nth-child(2) {
		animation-delay: 80ms;
	}
	@keyframes appear {
		from {
			opacity: 0;
			transform: scale(0.97);
		}
	}
	.tile :global(.save) {
		position: absolute;
		inset-block-start: 0.5rem;
		inset-inline-end: 0.5rem;
		opacity: 0;
		transition: opacity var(--ui-dur) ease;
	}
	.tile:hover :global(.save),
	.tile:focus-within :global(.save) {
		opacity: 1;
	}
	@media (hover: none) {
		.tile :global(.save) {
			opacity: 1;
		}
	}
	.empty,
	.failed {
		grid-column: 1 / -1;
		align-self: center;
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
		text-align: center;
	}
	.failed {
		color: var(--ui-danger);
	}
	@media (prefers-reduced-motion: reduce) {
		.tile {
			animation: none;
		}
	}
</style>
