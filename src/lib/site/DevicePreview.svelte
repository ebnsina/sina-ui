<script lang="ts">
	import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
	import Button from '#lib/ui/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';

	// The real site in a frame, at the width of the device you pick; it scales down to fit.
	const devices = {
		desktop: { label: 'Desktop', width: 1280, height: 800 },
		tablet: { label: 'Tablet', width: 820, height: 1000 },
		phone: { label: 'Phone', width: 390, height: 780 }
	};
	let device = $state<keyof typeof devices>('desktop');
	let box = $state(0);
	const d = $derived(devices[device]);
	const scale = $derived(box ? Math.min(1, box / d.width) : 1);
	let { src, title }: { src: string; title: string } = $props();
</script>

<div class="device">
	<div class="bar">
		<Segmented
			label="Device"
			hideLabel
			options={Object.entries(devices).map(([value, v]) => ({ value, label: v.label }))}
			bind:value={device}
		/>
		<Button variant="secondary" size="sm" href={src} target="_blank" rel="noopener"
			>Open it <Icon icon={ArrowUpRight01Icon} size={14} /></Button
		>
	</div>
	<!-- The frame is laid out at the device's real width, then scaled from its top-left corner into a
	     box exactly that size scaled, so it fills the space with nothing cut off. -->
	<div class="stage" bind:clientWidth={box}>
		<div
			class="screen"
			style:inline-size="{d.width * scale}px"
			style:block-size="{d.height * scale}px"
		>
			{#key device}
				<iframe
					title="{title}, at {d.label.toLowerCase()} width"
					{src}
					loading="lazy"
					style:inline-size="{d.width}px"
					style:block-size="{d.height}px"
					style:scale
				></iframe>
			{/key}
		</div>
	</div>
</div>

<style>
	.device {
		display: grid;
		gap: 0.75rem;
		inline-size: 100%;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.stage {
		display: grid;
		justify-items: center;
		min-inline-size: 0;
	}
	.screen {
		position: relative;
		overflow: hidden;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-bg);
		box-shadow: var(--ui-shadow-card);
	}
	iframe {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		border: 0;
		transform-origin: 0 0;
		animation: in var(--ui-dur-overlay) var(--ui-ease-out) both;
	}
	iframe:dir(rtl) {
		transform-origin: 100% 0;
	}
	@keyframes in {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		iframe {
			animation: none;
		}
	}
</style>
