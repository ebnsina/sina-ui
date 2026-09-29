<script lang="ts" module>
	export interface TreeNode {
		id: string;
		name: string;
		/** Present (even empty) for folders. Empty and with `load` set, it's fetched when first opened. */
		children?: TreeNode[];
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import {
		ArrowRight01Icon,
		CodeIcon,
		File02Icon,
		Folder01Icon,
		FolderOpenIcon,
		Image01Icon,
		Note01Icon,
		Pdf01Icon
	} from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';
	import { scrollEdges } from './scroll-edges';
	import SearchField from './SearchField.svelte';
	import Spinner from './Spinner.svelte';

	interface Props {
		/** Names the tree for screen readers. */
		label: string;
		items: TreeNode[];
		/** Ids of open folders. */
		expanded?: string[];
		/** Id of the chosen item. */
		selected?: string;
		onselect?: (node: TreeNode) => void;
		/** Fetches a folder's contents the first time it opens (its `children` start empty). */
		load?: (node: TreeNode) => Promise<TreeNode[]>;
		/** Shows a search box over the tree with this label; matches anywhere in it are shown. */
		searchLabel?: string;
		/** The search, if you'd rather drive it yourself. */
		query?: string;
		/** Height of the scrolling area: any CSS length. Only the rows in it are drawn. */
		height?: string;
	}

	let {
		label,
		items,
		expanded = $bindable([]),
		selected = $bindable(),
		onselect,
		load,
		searchLabel,
		query = $bindable(''),
		height = '20rem'
	}: Props = $props();

	const uid = $props.id();
	type Row = { node: TreeNode; depth: number; parent?: TreeNode; size: number; pos: number };

	// Folders fetched with `load`, and those still on their way.
	let fetched = $state(new Map<string, TreeNode[]>());
	let loading = $state(new Set<string>());
	const kids = (n: TreeNode) => fetched.get(n.id) ?? n.children ?? [];

	const open = $derived(new Set(expanded));
	const q = $derived(query.trim().toLowerCase());

	// Searching: a node shows if it matches or holds something that does; its folders open to it.
	const found = $derived.by(() => {
		if (!q) return undefined;
		const keep = new Set<string>();
		let hits = 0;
		const walk = (nodes: TreeNode[]): boolean => {
			let any = false;
			for (const n of nodes) {
				const self = n.name.toLowerCase().includes(q);
				if (self) hits++;
				const inner = n.children ? walk(kids(n)) : false;
				if (self || inner) {
					keep.add(n.id);
					any = true;
				}
			}
			return any;
		};
		walk(items);
		return { keep, hits };
	});

	// Everything reachable right now, flattened: the rows the list scrolls through.
	const rows = $derived.by(() => {
		const out: Row[] = [];
		const walk = (nodes: TreeNode[], depth: number, parent?: TreeNode) => {
			const shown = found ? nodes.filter((n) => found.keep.has(n.id)) : nodes;
			shown.forEach((node, i) => {
				out.push({ node, depth, parent, size: shown.length, pos: i + 1 });
				if (node.children && (found || open.has(node.id))) walk(kids(node), depth + 1, node);
			});
		};
		walk(items, 0);
		return out;
	});
	const isOpen = (n: TreeNode) => !!n.children && (!!found || open.has(n.id));

	// Windowing: a fixed row height, so which rows are on screen is arithmetic, not measurement.
	let rowHeight = $state(32);
	let viewport = $state<HTMLDivElement>();
	let scrollTop = $state(0);
	let viewHeight = $state(0);
	const overscan = 8;
	const first = $derived(Math.max(0, Math.floor(scrollTop / rowHeight) - overscan));
	const last = $derived(
		Math.min(rows.length, Math.ceil((scrollTop + viewHeight) / rowHeight) + overscan)
	);
	const windowed = $derived(rows.slice(first, last).map((r, i) => ({ ...r, index: first + i })));
	const sizeRows = (node: HTMLElement) => {
		const coarse = matchMedia('(pointer: coarse)');
		const set = () => (rowHeight = coarse.matches ? 44 : 32);
		set();
		coarse.addEventListener('change', set);
		return () => coarse.removeEventListener('change', set);
	};

	// The active row (keyboard) is announced through aria-activedescendant: focus stays on the
	// tree, so rows can come and go as it scrolls without losing anyone's place.
	let active = $state<string>();
	const activeRow = $derived(
		rows.find((r) => r.node.id === active) ?? rows.find((r) => r.node.id === selected) ?? rows[0]
	);
	const rowId = (id: string) => `${uid}-${id.replaceAll(/[^a-zA-Z0-9_-]/g, '_')}`;

	async function reveal(index: number) {
		if (!viewport) return;
		const top = index * rowHeight;
		if (top < viewport.scrollTop) viewport.scrollTop = top;
		else if (top + rowHeight > viewport.scrollTop + viewport.clientHeight)
			viewport.scrollTop = top + rowHeight - viewport.clientHeight;
		await tick();
	}
	function goTo(index: number) {
		const r = rows[Math.max(0, Math.min(rows.length - 1, index))];
		if (!r) return;
		active = r.node.id;
		reveal(rows.indexOf(r));
	}

	// Rows that just appeared because a folder opened fade in; rows scrolled into view don't.
	let entering = $state(new Set<string>());
	async function toggle(n: TreeNode, to = !open.has(n.id)) {
		if (!n.children || found) return;
		if (to && load && !n.children.length && !fetched.has(n.id)) {
			loading = new Set(loading).add(n.id);
			expanded = [...expanded, n.id];
			try {
				fetched = new Map(fetched).set(n.id, await load(n));
			} finally {
				const next = new Set(loading);
				next.delete(n.id);
				loading = next;
			}
		} else expanded = to ? [...expanded, n.id] : expanded.filter((x) => x !== n.id);
		if (to) {
			entering = new Set(kids(n).map((c) => c.id));
			setTimeout(() => (entering = new Set()), 300);
		}
	}
	function choose(n: TreeNode) {
		selected = n.id;
		onselect?.(n);
	}

	let typed = '';
	let typedAt = 0;
	function onkeydown(e: KeyboardEvent) {
		const at = activeRow ? rows.indexOf(activeRow) : -1;
		if (at < 0) return;
		const { node, parent } = rows[at];
		const rtl = getComputedStyle(e.currentTarget as Element).direction === 'rtl';
		const key = rtl
			? ({ ArrowLeft: 'ArrowRight', ArrowRight: 'ArrowLeft' }[e.key] ?? e.key)
			: e.key;
		const page = Math.max(1, Math.floor(viewHeight / rowHeight) - 1);
		switch (key) {
			case 'ArrowDown':
				goTo(at + 1);
				break;
			case 'ArrowUp':
				goTo(at - 1);
				break;
			case 'PageDown':
				goTo(at + page);
				break;
			case 'PageUp':
				goTo(at - page);
				break;
			case 'Home':
				goTo(0);
				break;
			case 'End':
				goTo(rows.length - 1);
				break;
			case 'ArrowRight':
				// Opens a closed folder; in an open one, steps to its first child.
				if (node.children && !isOpen(node)) toggle(node, true);
				else if (node.children && kids(node).length) goTo(at + 1);
				break;
			case 'ArrowLeft':
				// Closes an open folder; otherwise goes up to the folder it's in.
				if (node.children && isOpen(node) && !found) toggle(node, false);
				else if (parent) goTo(rows.findIndex((r) => r.node === parent));
				break;
			case 'Enter':
			case ' ':
				if (node.children) toggle(node);
				choose(node);
				break;
			default:
				if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
				// Typeahead: letters typed together find the next row starting with them.
				typed = performance.now() - typedAt > 500 ? e.key : typed + e.key;
				typedAt = performance.now();
				const t = typed.toLowerCase();
				const order = [...rows.slice(at + (t.length === 1 ? 1 : 0)), ...rows.slice(0, at)];
				const hit = order.find((r) => r.node.name.toLowerCase().startsWith(t));
				if (hit) goTo(rows.indexOf(hit));
		}
		e.preventDefault();
	}

	const fileIcon = (name: string) => {
		const ext = name.split('.').pop()?.toLowerCase() ?? '';
		if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return Image01Icon;
		if (ext === 'pdf') return Pdf01Icon;
		if (['ts', 'js', 'svelte', 'json', 'css', 'html'].includes(ext)) return CodeIcon;
		if (['md', 'txt'].includes(ext)) return Note01Icon;
		return File02Icon;
	};
	// The matching part of a name, for highlighting.
	const parts = (name: string) => {
		const i = q ? name.toLowerCase().indexOf(q) : -1;
		return i < 0
			? [name, '', '']
			: [name.slice(0, i), name.slice(i, i + q.length), name.slice(i + q.length)];
	};
	const count = new Intl.NumberFormat('en');
</script>

<div class="file-tree" style:--row="{rowHeight}px">
	{#if searchLabel}
		<div class="search">
			<SearchField label={searchLabel} placeholder="Search" bind:value={query} />
			<p class="found" aria-live="polite">
				{#if found}{found.hits
						? `${count.format(found.hits)} ${found.hits === 1 ? 'match' : 'matches'}`
						: 'Nothing matches'}{/if}
			</p>
		</div>
	{/if}
	<div
		bind:this={viewport}
		bind:clientHeight={viewHeight}
		class="viewport"
		style:block-size={height}
		role="tree"
		aria-label={label}
		aria-activedescendant={activeRow ? rowId(activeRow.node.id) : undefined}
		tabindex="0"
		{onkeydown}
		onscroll={(e) => (scrollTop = e.currentTarget.scrollTop)}
		{@attach sizeRows}
		{@attach scrollEdges}
		data-fade
	>
		<div class="spacer" style:block-size="{rows.length * rowHeight}px">
			{#each windowed as r (r.node.id)}
				{@const opened = isOpen(r.node)}
				{@const [a, b, c] = parts(r.node.name)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					id={rowId(r.node.id)}
					role="treeitem"
					tabindex="-1"
					class={[
						'row',
						r.node.id === activeRow?.node.id && 'active',
						entering.has(r.node.id) && 'enter'
					]}
					style:transform="translateY({r.index * rowHeight}px)"
					style:--depth={r.depth}
					aria-level={r.depth + 1}
					aria-setsize={r.size}
					aria-posinset={r.pos}
					aria-expanded={r.node.children ? opened : undefined}
					aria-selected={selected === r.node.id}
					aria-busy={loading.has(r.node.id) || undefined}
					onclick={() => {
						active = r.node.id;
						viewport?.focus({ preventScroll: true });
						if (r.node.children) toggle(r.node);
						choose(r.node);
					}}
				>
					<span class={['chevron', opened && !loading.has(r.node.id) && 'open']} aria-hidden="true">
						<!-- Loading, the chevron turns into a spinner where the eye already is. -->
						{#if loading.has(r.node.id)}<Spinner
								size={14}
							/>{:else if r.node.children && (kids(r.node).length || (load && !fetched.has(r.node.id)))}<Icon
								icon={ArrowRight01Icon}
								size={14}
							/>{/if}
					</span>
					<span class="icon" aria-hidden="true">
						<Icon
							icon={r.node.children
								? opened
									? FolderOpenIcon
									: Folder01Icon
								: fileIcon(r.node.name)}
							size={16}
						/>
					</span>
					<span class="name"
						>{a}{#if b}<mark>{b}</mark>{/if}{c}</span
					>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.file-tree {
		inline-size: 100%;
		color: var(--ui-fg);
		font: 0.875rem/1.4 var(--ui-font);
	}
	.search {
		display: grid;
		gap: 0.25rem;
		margin-block-end: 0.5rem;
	}
	.found {
		min-block-size: 1.2em;
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.75rem;
	}
	.viewport {
		position: relative;
		overflow-y: auto;
		overscroll-behavior: contain;
		/* Only the rows in view are laid out and painted. */
		contain: strict;
		border-radius: var(--ui-radius);
		outline: none;
	}
	.viewport:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.spacer {
		position: relative;
	}
	/* Rows sit at their place in the list; opening a folder slides the ones below down. */
	.row {
		position: absolute;
		inset-inline: 0.25rem;
		inset-block-start: 0;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		box-sizing: border-box;
		block-size: var(--row);
		padding-inline: calc(0.375rem + var(--depth) * 1.125rem) 0.5rem;
		border-radius: calc(var(--ui-radius) - 0.125rem);
		cursor: pointer;
		user-select: none;
		transition:
			transform 220ms var(--ui-ease-out),
			background-color 120ms ease;
	}
	.row.enter {
		animation: enter 220ms var(--ui-ease-out) backwards;
	}
	@keyframes enter {
		from {
			opacity: 0;
		}
	}
	.row:hover {
		background: var(--ui-subtle);
	}
	/* The keyboard's place, shown while the tree has focus. */
	.viewport:focus-visible .row.active {
		box-shadow: inset 0 0 0 2px var(--ui-ring);
	}
	.row[aria-selected='true'] {
		background: color-mix(in srgb, var(--ui-accent) 12%, transparent);
		color: color-mix(in srgb, var(--ui-accent) 80%, var(--ui-fg));
		font-weight: 500;
	}
	.chevron {
		display: grid;
		flex: none;
		inline-size: 14px;
		color: var(--ui-muted);
		transition: transform var(--ui-dur-overlay) var(--ui-ease-out);
	}
	.chevron.open {
		transform: rotate(90deg);
	}
	.chevron:dir(rtl) {
		transform: scaleX(-1);
	}
	.chevron.open:dir(rtl) {
		transform: scaleX(-1) rotate(90deg);
	}
	.icon {
		display: grid;
		flex: none;
		color: var(--ui-muted);
	}
	.row[aria-expanded] .icon {
		color: color-mix(in srgb, var(--ui-warning) 80%, var(--ui-fg));
	}
	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	mark {
		border-radius: 3px;
		background: color-mix(in srgb, var(--ui-accent) 22%, transparent);
		color: inherit;
	}
	@media (prefers-reduced-motion: reduce) {
		.row,
		.chevron {
			transition: none;
		}
		.row.enter {
			animation: none;
		}
	}
	@media (forced-colors: active) {
		.row[aria-selected='true'] {
			outline: 2px solid Highlight;
		}
	}
</style>
