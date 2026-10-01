<script lang="ts">
	import Avatar from './Avatar.svelte';
	import Popover from './Popover.svelte';
	import Tooltip from './Tooltip.svelte';

	interface Person {
		name: string;
		src?: string;
	}
	interface Props {
		people: Person[];
		/** How many show before the rest fold into "+N". */
		max?: number;
		size?: 'sm' | 'md' | 'lg';
		/** Names the group, e.g. "7 readers". Defaults to "{count} people". */
		label?: string;
		/** Pressing a person. Without it they still show their name on hover and focus. */
		onselect?: (person: Person) => void;
		class?: string;
	}

	let { people, max = 4, size = 'md', label, onselect, class: className }: Props = $props();

	// Showing "+1" would hide one face behind a chip the same size: show them all instead.
	const shown = $derived(people.length - max === 1 ? people : people.slice(0, max));
	const rest = $derived(people.slice(shown.length));
</script>

<div
	class={['avatar-group', size, className]}
	role="group"
	aria-label={label ?? `${people.length} ${people.length === 1 ? 'person' : 'people'}`}
>
	{#each shown as person, i (person.name + i)}
		<Tooltip text={person.name} labels>
			{#snippet trigger(props)}
				<button
					type="button"
					class="member"
					style:--i={i}
					{...props}
					onclick={() => onselect?.(person)}
				>
					<Avatar name={person.name} src={person.src} {size} decorative />
				</button>
			{/snippet}
		</Tooltip>
	{/each}
	{#if rest.length}
		<Popover title="{rest.length} more" side="bottom" align="center">
			{#snippet trigger(props)}
				<button type="button" class="member more" style:--i={shown.length} {...props}>
					<span class="chip">+{rest.length}</span>
				</button>
			{/snippet}
			<ul class="rest">
				{#each rest as person, i (person.name + i)}
					<li>
						<Avatar name={person.name} src={person.src} size="sm" decorative />
						<span>{person.name}</span>
					</li>
				{/each}
			</ul>
		</Popover>
	{/if}
</div>

<style>
	.avatar-group {
		--size: 2.5rem;
		--overlap: calc(var(--size) * -0.28);
		/* Faces fan out a little while the group is hovered: transform only, nothing reflows. */
		--spread: 0px;
		display: inline-flex;
		align-items: center;
	}
	.avatar-group:dir(rtl) {
		--dir: -1;
	}
	.sm {
		--size: 2rem;
	}
	.lg {
		--size: 3.5rem;
	}
	/* Touch: less overlap, so every face keeps a 24px target (WCAG 2.5.8). */
	@media (pointer: coarse) {
		.avatar-group {
			--overlap: calc(var(--size) * -0.18);
		}
	}
	@media (hover: hover) and (prefers-reduced-motion: no-preference) {
		.avatar-group:hover,
		.avatar-group:focus-within {
			--spread: 4px;
		}
	}
	.member {
		position: relative;
		display: grid;
		flex: none;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: none;
		/* A ring in the surface color keeps each face apart from the one behind it. */
		box-shadow: 0 0 0 2px var(--ring, var(--ui-surface));
		color: inherit;
		cursor: default;
		translate: calc(var(--i) * var(--spread) * var(--dir, 1)) 0;
		transition:
			translate var(--ui-dur-spring) var(--ui-ease-spring),
			scale var(--ui-dur) var(--ui-ease-out);
	}
	.member:not(:first-child) {
		margin-inline-start: var(--overlap);
	}
	/* The one pointed at comes forward and lifts a touch. */
	.member:hover,
	.member:focus-visible {
		z-index: 1;
		translate: calc(var(--i) * var(--spread) * var(--dir, 1)) -2px;
	}
	.member:active {
		scale: 0.96;
	}
	.member:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.more {
		cursor: pointer;
	}
	.chip {
		display: grid;
		place-items: center;
		inline-size: var(--size);
		block-size: var(--size);
		border-radius: 50%;
		background: var(--ui-subtle);
		color: var(--ui-fg);
		font: 600 calc(var(--size) * 0.34) / 1 var(--ui-font);
		font-variant-numeric: tabular-nums;
		transition: background-color var(--ui-dur-press) ease;
	}
	.more:hover .chip {
		background: var(--ui-hover);
	}
	.rest {
		display: grid;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.rest li {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		font-size: 0.875rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.member {
			transition: none;
		}
	}
</style>
