<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { SvelteMap } from 'svelte/reactivity';
	import { Add01Icon, CenterFocusIcon, MinusSignIcon } from '@hugeicons/core-free-icons';
	import { announce } from './announce';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Tooltip from './Tooltip.svelte';
	import { reduced } from './motion';
	import { toast } from './toast';
	import {
		addChild,
		countBelow,
		edge,
		find,
		layout,
		parentOf,
		remove,
		reparent,
		update,
		type MindNode,
		type Placed,
		type Size
	} from './mindmap';

	interface Props {
		/** The map: one central topic and its branches. Bindable; edits replace it with a new tree. */
		root: MindNode;
		/** Names the map for screen readers ("Plan for the reading room"). */
		label: string;
		/** Add, rename, move and remove topics. Collapsing works either way. */
		editable?: boolean;
		/** Branches on both sides of the center, or all to the right (for outlines). */
		sides?: 'both' | 'right';
		/** Called with the new tree after every change. */
		onchange?: (root: MindNode) => void;
		class?: string;
	}

	let {
		root = $bindable(),
		label,
		editable = false,
		sides = 'both',
		onchange,
		class: className
	}: Props = $props();

	const uid = $props.id();
	const MIN = 0.3;
	const MAX = 2.5;
	// Branch colors when a first-level topic doesn't set its own.
	const palette = [
		'var(--ui-accent)',
		'light-dark(#0369a1, #38bdf8)',
		'light-dark(#be123c, #fb7185)',
		'light-dark(#6d28d9, #a78bfa)',
		'var(--ui-warning)'
	];
	const percent = new Intl.NumberFormat('en-US', { style: 'percent' });

	let viewport = $state<HTMLDivElement>();
	let tree = $state<HTMLDivElement>();
	let sizes = $state<Record<string, Size>>({});
	let view = $state({ x: 0, y: 0, k: 1 });
	let smooth = $state(false);
	let selected = $state(untrack(() => root.id));
	let editing = $state<string>();
	let dropOn = $state<string>();
	let drag = $state<{ id: string; set: string[]; dx: number; dy: number }>();
	// A new tree from outside is refitted; one this map just made itself is not.
	let mine = false;
	let shown: MindNode | undefined;
	let settled = false;

	const guess = (id: string) => (id === root.id ? { w: 160, h: 48 } : { w: 120, h: 36 });
	const target = $derived(layout(root, (id) => sizes[id] ?? guess(id), sides));

	// ── Drawing: every topic glides from where it is to where the layout puts it ──────────────────
	type Pos = { x: number; y: number; o: number };
	let drawn = $state.raw(new Map<string, Pos>());
	// Last known place and parent of everything drawn, so leaving topics can shrink into theirs.
	const known: Record<string, Placed> = {};
	let raf = 0;

	function settle(next: Map<string, Placed>) {
		for (const [id, p] of next) known[id] = p;
		const end = new Map<string, Pos>([...next].map(([id, p]) => [id, { x: p.x, y: p.y, o: 1 }]));
		cancelAnimationFrame(raf);
		if (!settled || reduced()) {
			drawn = end;
			return;
		}
		const from = drawn;
		// Nearest ancestor present in `m`: where a topic grows from, or shrinks into.
		const anchor = (id: string, m: Map<string, Pos>) => {
			for (let p = known[id]?.parent; p; p = known[p]?.parent) if (m.has(p)) return m.get(p)!;
			return { x: 0, y: 0, o: 0 };
		};
		// In layout order, leaving ones last: reordering the DOM mid-glide would drop focus.
		const ids = new Set([...end.keys(), ...from.keys()]);
		const a = new Map([...ids].map((id) => [id, from.get(id) ?? { ...anchor(id, from), o: 0 }]));
		const b = new Map([...ids].map((id) => [id, end.get(id) ?? { ...anchor(id, end), o: 0 }]));
		const t0 = performance.now();
		const step = (now: number) => {
			const t = Math.min(1, (now - t0) / 380);
			const e = cubicOut(t);
			const mix = (u: number, v: number) => u + (v - u) * e;
			drawn =
				t < 1
					? new Map(
							[...ids].map((id) => {
								const [p, q] = [a.get(id)!, b.get(id)!];
								return [id, { x: mix(p.x, q.x), y: mix(p.y, q.y), o: mix(p.o, q.o) }];
							})
						)
					: end;
			if (t < 1) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
	}

	$effect(() => {
		const next = target;
		untrack(() => {
			settle(next);
			if (!settled) fit(false);
			else if (root !== shown && !mine) fit();
			shown = root;
			mine = false;
		});
	});

	onMount(() => {
		// Sizes are measured in the first frames; glide only after that.
		requestAnimationFrame(() => requestAnimationFrame(() => (settled = true)));
		return () => cancelAnimationFrame(raf);
	});

	const items = $derived(
		[...drawn].map(([id, pos]) => {
			const p = target.get(id) ?? known[id];
			const off = drag?.id === id ? { x: drag.dx, y: drag.dy } : { x: 0, y: 0 };
			return { p, x: pos.x + off.x, y: pos.y + off.y, o: pos.o, leaving: !target.has(id) };
		})
	);
	const byId = $derived(new Map(items.map((i) => [i.p.node.id, i])));
	const hue: Record<string, number> = {};
	let hues = 0;
	const color = (p: Placed) => {
		if (p.branch < 0) return 'var(--ui-accent)';
		const first = root.children?.[p.branch];
		if (!first) return palette[0];
		// Each branch keeps its color when others are added, moved or removed.
		hue[first.id] ??= hues++;
		return first.color ?? palette[hue[first.id] % palette.length];
	};

	function measure(id: string) {
		return (el: HTMLElement) => {
			const ro = new ResizeObserver(() => {
				const s = { w: el.offsetWidth, h: el.offsetHeight };
				const old = sizes[id];
				if (!old || old.w !== s.w || old.h !== s.h) sizes[id] = s;
			});
			ro.observe(el);
			return () => ro.disconnect();
		};
	}

	// ── View: one transform on one layer; the layer's origin is the middle of the viewport ─────────
	const clamp = (k: number) => Math.min(MAX, Math.max(MIN, k));

	function glideView(next: typeof view) {
		smooth = !reduced();
		view = next;
		setTimeout(() => (smooth = false), 320);
	}

	function fit(animate = true) {
		if (!viewport || !target.size) return;
		const ps = [...target.values()];
		const x1 = Math.min(...ps.map((p) => p.x - p.w / 2));
		const x2 = Math.max(...ps.map((p) => p.x + p.w / 2));
		const y1 = Math.min(...ps.map((p) => p.y - p.h / 2));
		const y2 = Math.max(...ps.map((p) => p.y + p.h / 2));
		const { clientWidth: vw, clientHeight: vh } = viewport;
		// Never smaller than readable: on a phone, a big map fits its middle and pans for the rest.
		const k = Math.min(1.25, (vw - 48) / (x2 - x1), (vh - 96) / (y2 - y1));
		const next =
			k < 0.5
				? { k: 0.5, x: 0, y: 0 }
				: { k, x: (-k * (x1 + x2)) / 2, y: (-k * (y1 + y2)) / 2 - 20 };
		if (animate) glideView(next);
		else view = next;
	}

	/** Zooms keeping the point under (px, py), relative to the viewport's middle, in place. */
	function zoomAt(px: number, py: number, k: number) {
		k = clamp(k);
		view = { k, x: px - ((px - view.x) * k) / view.k, y: py - ((py - view.y) * k) / view.k };
	}
	const center = (e: { clientX: number; clientY: number }) => {
		const r = viewport!.getBoundingClientRect();
		return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2] as const;
	};
	/** The map point under a screen point. */
	const toMap = (e: { clientX: number; clientY: number }) => {
		const [px, py] = center(e);
		return { x: (px - view.x) / view.k, y: (py - view.y) / view.k };
	};

	function zoomBy(f: number) {
		smooth = !reduced();
		zoomAt(0, 0, view.k * f);
		setTimeout(() => (smooth = false), 320);
	}

	/** Pans just enough to bring a topic into view. */
	function reveal(id: string) {
		const p = target.get(id);
		if (!p || !viewport) return;
		const hw = viewport.clientWidth / 2 - 24;
		const hh = viewport.clientHeight / 2 - 24;
		const sx = view.x + p.x * view.k;
		const sy = view.y + p.y * view.k;
		const ex = (p.w / 2) * view.k;
		const ey = (p.h / 2) * view.k;
		const dx = Math.min(0, hw - (sx + ex)) - Math.min(0, sx - ex + hw);
		const dy = Math.min(0, hh - (sy + ey)) - Math.min(0, sy - ey + hh);
		if (dx || dy) glideView({ ...view, x: view.x + dx, y: view.y + dy });
	}

	function wheel(el: HTMLElement) {
		const onwheel = (e: WheelEvent) => {
			e.preventDefault();
			const unit = e.deltaMode === 1 ? 16 : 1;
			if (e.ctrlKey || e.metaKey) {
				const [px, py] = center(e);
				zoomAt(px, py, view.k * Math.exp(-e.deltaY * unit * 0.01));
			} else {
				view = { ...view, x: view.x - e.deltaX * unit, y: view.y - e.deltaY * unit };
			}
		};
		// Safari's trackpad pinch.
		let g0 = 1;
		const gesture = (e: Event & { scale?: number; clientX?: number; clientY?: number }) => {
			e.preventDefault();
			if (e.type === 'gesturestart') g0 = view.k;
			else zoomAt(...center(e as unknown as MouseEvent), g0 * (e.scale ?? 1));
		};
		el.addEventListener('wheel', onwheel, { passive: false });
		el.addEventListener('gesturestart', gesture);
		el.addEventListener('gesturechange', gesture);
		return () => {
			el.removeEventListener('wheel', onwheel);
			el.removeEventListener('gesturestart', gesture);
			el.removeEventListener('gesturechange', gesture);
		};
	}

	// ── Pointer: drag the background to pan, two fingers to pinch, drag a topic to move it ────────
	const pointers = new SvelteMap<number, { x: number; y: number }>();
	let press: { id?: string; x: number; y: number; on: boolean } | undefined;

	function down(e: PointerEvent) {
		if (e.button !== 0 || (e.target as Element).closest('input, .tools')) return;
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.size > 1) {
			cancelDrag();
			press = undefined;
			return;
		}
		const id = (e.target as Element).closest<HTMLElement>('[data-id]')?.dataset.id;
		press = { id, x: e.clientX, y: e.clientY, on: false };
	}

	function move(e: PointerEvent) {
		const last = pointers.get(e.pointerId);
		if (!last) return;
		if (pointers.size === 2) {
			const [a, b] = [...pointers.values()];
			const before = Math.hypot(a.x - b.x, a.y - b.y);
			const midBefore = { clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 };
			pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
			const [c, d] = [...pointers.values()];
			const mid = { clientX: (c.x + d.x) / 2, clientY: (c.y + d.y) / 2 };
			zoomAt(...center(mid), (view.k * Math.hypot(c.x - d.x, c.y - d.y)) / (before || 1));
			view = {
				...view,
				x: view.x + mid.clientX - midBefore.clientX,
				y: view.y + mid.clientY - midBefore.clientY
			};
			return;
		}
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (!press) return;
		const dx = e.clientX - press.x;
		const dy = e.clientY - press.y;
		if (!press.on) {
			if (Math.hypot(dx, dy) < 5) return;
			press.on = true;
			viewport!.setPointerCapture(e.pointerId);
			const node = press.id && press.id !== root.id && editable ? find(root, press.id) : undefined;
			if (node) {
				const set: string[] = [];
				const walk = (n: MindNode) => (set.push(n.id), n.children?.forEach(walk));
				walk(node);
				drag = { id: node.id, set, dx: 0, dy: 0 };
			}
		}
		if (drag) {
			drag.dx = dx / view.k;
			drag.dy = dy / view.k;
			const at = toMap(e);
			const hit = items.find(
				(i) =>
					!i.leaving &&
					i.p.node.id !== drag!.id &&
					Math.abs(at.x - i.x) < i.p.w / 2 &&
					Math.abs(at.y - i.y) < i.p.h / 2
			)?.p.node.id;
			// Its own branch stays put, so it can be pointed at: marked, and refused on drop.
			const own = !!hit && drag.set.includes(hit);
			dropOn = own ? undefined : hit;
			refusing = own ? hit : undefined;
		} else {
			view = { ...view, x: view.x + e.movementX, y: view.y + e.movementY };
		}
	}
	let refusing = $state<string>();

	function up(e: PointerEvent) {
		pointers.delete(e.pointerId);
		if (!drag) {
			press = undefined;
			return;
		}
		const { id, dx, dy } = drag;
		const to = dropOn;
		const wasRefusing = refusing;
		// Where the branch was let go is where it glides from.
		drawn = new Map(
			[...drawn].map(([k, p]) => [k, k === id ? { ...p, x: p.x + dx, y: p.y + dy } : p])
		);
		cancelDrag();
		press = undefined;
		if (to) {
			const next = reparent(root, id, to);
			if (next) {
				commit(next);
				select(id);
				announce(`Moved under ${find(next, to)?.label}`);
			}
		} else if (wasRefusing) toast('A topic can’t go inside its own branch.');
		settle(target);
	}

	function cancelDrag() {
		drag = undefined;
		dropOn = undefined;
		refusing = undefined;
	}

	// ── Editing ───────────────────────────────────────────────────────────────────────────────────
	function commit(next: MindNode) {
		mine = true;
		root = next;
		onchange?.(next);
	}

	async function select(id: string, focus = true) {
		selected = id;
		await tick();
		if (focus)
			tree
				?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)
				?.focus({ preventScroll: true });
		reveal(id);
	}

	function toggle(id: string) {
		const n = find(root, id);
		if (!n?.children?.length) return;
		commit(update(root, id, { collapsed: !n.collapsed }));
		announce(n.collapsed ? 'Expanded' : `Collapsed, ${countBelow(n)} hidden`);
	}

	async function add(asChild: boolean) {
		const parent =
			asChild || selected === root.id ? find(root, selected) : parentOf(root, selected);
		if (!parent) return;
		const at =
			asChild || parent.id === selected
				? undefined
				: (parent.children ?? []).findIndex((c) => c.id === selected) + 1;
		const node = { id: crypto.randomUUID(), label: 'New topic' };
		commit(addChild(root, parent.id, node, at));
		await select(node.id, false);
		editing = node.id;
	}

	function rename(id: string, value: string, keep = true) {
		editing = undefined;
		const text = value.trim();
		if (keep && text && text !== find(root, id)?.label) commit(update(root, id, { label: text }));
		select(id);
	}

	function del(id: string) {
		const parent = parentOf(root, id);
		const node = find(root, id);
		if (!parent || !node) return;
		const at = parent.children!.indexOf(node);
		commit(remove(root, id));
		select(parent.id);
		toast(`Removed “${node.label}”`, {
			action: {
				label: 'Undo',
				onclick: () => {
					if (!find(root, parent.id) || find(root, id)) return;
					commit(addChild(root, parent.id, node, at));
					select(id);
				}
			}
		});
	}

	/** The nearest topic in a direction, by where they sit on screen. */
	function nearest(dir: 'left' | 'right' | 'up' | 'down') {
		const cur = target.get(selected);
		if (!cur) return;
		const [ax, sign] = { left: ['x', -1], right: ['x', 1], up: ['y', -1], down: ['y', 1] }[dir] as [
			'x' | 'y',
			number
		];
		const other = ax === 'x' ? 'y' : 'x';
		let best: string | undefined;
		let score = Infinity;
		for (const [id, p] of target) {
			const d = (p[ax] - cur[ax]) * sign;
			if (id === selected || d <= 1) continue;
			const s = d + 2 * Math.abs(p[other] - cur[other]);
			if (s < score) [score, best] = [s, id];
		}
		return best;
	}

	function key(e: KeyboardEvent) {
		if (editing) return;
		const arrows: Record<string, 'left' | 'right' | 'up' | 'down'> = {
			ArrowLeft: 'left',
			ArrowRight: 'right',
			ArrowUp: 'up',
			ArrowDown: 'down'
		};
		const id = selected;
		let handled = true;
		if (arrows[e.key]) {
			const next = nearest(arrows[e.key]);
			if (next) select(next);
		} else if (e.key === 'Home') select(root.id);
		else if (e.key === ' ' || (e.key === 'Enter' && !editable)) toggle(id);
		else if (!editable || e.metaKey || e.ctrlKey || e.altKey) handled = false;
		else if (e.key === 'Enter') add(false);
		else if (e.key === 'Tab' && !e.shiftKey) add(true);
		else if (e.key === 'F2') editing = id;
		else if ((e.key === 'Delete' || e.key === 'Backspace') && id !== root.id) del(id);
		else handled = false;
		if (handled) e.preventDefault();
	}

	function field(el: HTMLInputElement) {
		el.focus({ preventScroll: true });
		el.select();
	}

	const setsize = (p: Placed) =>
		p.parent ? (target.get(p.parent)?.node.children?.length ?? 1) : 1;
	const posinset = (p: Placed) =>
		p.parent
			? (target.get(p.parent)?.node.children?.findIndex((c) => c.id === p.node.id) ?? 0) + 1
			: 1;
</script>

<div class={['mindmap', className]}>
	<p id="{uid}-help" class="sr-only">
		Arrow keys move between topics, Space opens or closes a branch, Home goes to the center.
		{#if editable}
			Enter adds a topic beside this one, Tab adds one inside it, F2 renames, Delete removes.
		{/if}
	</p>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- Panning and pinching are pointer gestures; the keyboard has the tree's keys and the zoom buttons. -->
	<div
		bind:this={viewport}
		class={['viewport', drag && 'dragging']}
		{@attach wheel}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		onlostpointercapture={(e) => pointers.has(e.pointerId) && up(e)}
	>
		<div
			class={['layer', smooth && 'smooth']}
			style:transform="translate({view.x}px, {view.y}px) scale({view.k})"
		>
			<svg class="edges" aria-hidden="true" width="1" height="1">
				{#each items as i (i.p.node.id)}
					{@const from = i.p.parent ? byId.get(i.p.parent) : undefined}
					{#if from}
						<path
							d={edge({ ...from.p, x: from.x, y: from.y }, { ...i.p, x: i.x, y: i.y })}
							style:--branch={color(i.p)}
							style:opacity={Math.min(i.o, from.o)}
							stroke-width={i.p.depth === 1 ? 2.5 : 1.75}
						/>
					{/if}
				{/each}
			</svg>

			<div
				bind:this={tree}
				role="tree"
				tabindex="-1"
				aria-label={label}
				aria-describedby="{uid}-help"
				onkeydown={key}
			>
				{#each items as i (i.p.node.id)}
					{@const n = i.p.node}
					{@const kids = n.children?.length ?? 0}
					<div
						role="treeitem"
						data-id={n.id}
						class={[
							'node',
							i.p.depth === 0 ? 'root' : i.p.depth === 1 ? 'first' : 'deep',
							drag?.id === n.id && 'lifted',
							dropOn === n.id && 'target',
							refusing === n.id && 'refuse',
							drag?.set.includes(n.id) && drag.id !== n.id && 'own'
						]}
						style:--branch={color(i.p)}
						style:transform="translate({i.x}px, {i.y}px) translate(-50%, -50%) scale({0.6 +
							0.4 * i.o})"
						style:opacity={i.o}
						tabindex={selected === n.id ? 0 : -1}
						aria-level={i.p.depth + 1}
						aria-setsize={setsize(i.p)}
						aria-posinset={posinset(i.p)}
						aria-expanded={kids ? !n.collapsed : undefined}
						aria-selected={selected === n.id}
						aria-hidden={i.leaving || undefined}
						inert={i.leaving}
						{@attach measure(n.id)}
						onclick={() => select(n.id)}
						ondblclick={() => editable && (editing = n.id)}
					>
						{#if n.icon}<Icon icon={n.icon} size={i.p.depth === 0 ? 20 : 16} />{/if}
						{#if editing === n.id}
							<input
								class="rename"
								value={n.label}
								aria-label="Topic name"
								size={Math.max(8, n.label.length)}
								{@attach field}
								onkeydown={(e) => {
									e.stopPropagation();
									if (e.key === 'Enter') rename(n.id, e.currentTarget.value);
									if (e.key === 'Escape') rename(n.id, '', false);
								}}
								onblur={(e) => editing === n.id && rename(n.id, e.currentTarget.value)}
							/>
						{:else}
							<span class="text">
								{n.label}
								{#if n.note}<small>{n.note}</small>{/if}
							</span>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Pointer shortcuts for Space; keyboard users have the key, so these stay out of the tab order. -->
			<div class="toggles" aria-hidden="true">
				{#each items as i (i.p.node.id)}
					{@const n = i.p.node}
					{#if n.children?.length && i.p.depth > 0}
						<button
							type="button"
							tabindex="-1"
							class={['toggle', n.collapsed && 'closed']}
							style:--branch={color(i.p)}
							style:transform="translate({i.x + i.p.side * (i.p.w / 2 + 2)}px, {i.y}px)
							translate(-50%, -50%) scale({i.o})"
							style:opacity={i.o}
							onclick={() => toggle(n.id)}
						>
							{#if n.collapsed}{countBelow(n)}{:else}<Icon
									icon={MinusSignIcon}
									size={12}
									strokeWidth={2.5}
								/>{/if}
						</button>
					{/if}
				{/each}
			</div>
		</div>
	</div>

	<div class="tools">
		<Tooltip text="Zoom out" labels>
			{#snippet trigger(props)}
				<Button
					{...props}
					variant="ghost"
					size="sm"
					square
					disabled={view.k <= MIN}
					onclick={() => zoomBy(1 / 1.25)}
				>
					<Icon icon={MinusSignIcon} size={16} />
				</Button>
			{/snippet}
		</Tooltip>
		<span class="zoom">{percent.format(view.k)}</span>
		<Tooltip text="Zoom in" labels>
			{#snippet trigger(props)}
				<Button
					{...props}
					variant="ghost"
					size="sm"
					square
					disabled={view.k >= MAX}
					onclick={() => zoomBy(1.25)}
				>
					<Icon icon={Add01Icon} size={16} />
				</Button>
			{/snippet}
		</Tooltip>
		<Tooltip text="Fit to screen" labels>
			{#snippet trigger(props)}
				<Button {...props} variant="ghost" size="sm" square onclick={() => fit()}>
					<Icon icon={CenterFocusIcon} size={16} />
				</Button>
			{/snippet}
		</Tooltip>
	</div>
</div>

<style>
	.mindmap {
		position: relative;
		block-size: 100%;
		min-block-size: 24rem;
		overflow: hidden;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		color: var(--ui-fg);
		font: 0.875rem/1.35 var(--ui-font);
	}
	.viewport {
		position: absolute;
		inset: 0;
		overflow: hidden;
		cursor: grab;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}
	.viewport:active,
	.dragging {
		cursor: grabbing;
	}
	.layer {
		position: absolute;
		top: 50%;
		left: 50%;
		transform-origin: 0 0;
	}
	.layer.smooth {
		transition: transform 300ms var(--ui-ease-out);
	}
	.edges {
		position: absolute;
		overflow: visible;
	}
	path {
		fill: none;
		stroke: color-mix(in srgb, var(--branch) 45%, transparent);
		stroke-linecap: round;
	}
	[role='tree'] {
		outline: none;
	}
	.node {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-sizing: border-box;
		inline-size: max-content;
		max-inline-size: 14rem;
		padding: 0.4375rem 0.75rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-xs);
		cursor: pointer;
		/* The pointer reaches the node under it even while the layer is mid-glide. */
		will-change: transform;
		transition: box-shadow var(--ui-dur) ease;
	}
	.node.first {
		padding: 0.5rem 0.875rem;
		background: color-mix(in srgb, var(--branch) 14%, var(--ui-surface));
		font-weight: 500;
	}
	.node.first :global(svg) {
		color: var(--branch);
	}
	.node.deep :global(svg) {
		color: var(--ui-muted);
	}
	.node.root {
		max-inline-size: 16rem;
		padding: 0.75rem 1.125rem;
		background: var(--ui-accent);
		color: var(--ui-on-accent);
		font-size: 1rem;
		font-weight: 600;
		box-shadow: var(--ui-shadow-card);
	}
	.text {
		display: grid;
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	small {
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 400;
	}
	.root small {
		color: inherit;
		opacity: 0.8;
	}
	.node:focus-visible,
	.node[aria-selected='true']:is(:focus-within, :focus) {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.node[aria-selected='true'] {
		box-shadow:
			0 0 0 2px color-mix(in srgb, var(--branch) 55%, transparent),
			var(--ui-shadow-xs);
	}
	.node.root[aria-selected='true'] {
		box-shadow:
			0 0 0 3px color-mix(in srgb, var(--ui-accent) 30%, transparent),
			var(--ui-shadow-card);
	}
	/* See-through, so the topic it would land on shows its ring underneath. */
	.node.lifted {
		z-index: 2;
		opacity: 0.85 !important;
		box-shadow: var(--ui-shadow-overlay);
		cursor: grabbing;
	}
	.node.target {
		box-shadow:
			0 0 0 2px var(--branch),
			var(--ui-shadow-card);
	}
	.node.own {
		opacity: 0.55 !important;
	}
	.node.refuse {
		box-shadow:
			0 0 0 2px var(--ui-danger),
			var(--ui-shadow-xs);
		cursor: not-allowed;
	}
	.rename {
		min-inline-size: 0;
		margin: -0.125rem -0.25rem;
		padding: 0.125rem 0.25rem;
		border: 0;
		border-radius: 0.375rem;
		outline: none;
		background: var(--ui-surface);
		color: var(--ui-fg);
		font: inherit;
		user-select: text;
		-webkit-user-select: text;
	}
	.toggle {
		position: absolute;
		top: 0;
		left: 0;
		display: grid;
		place-items: center;
		min-inline-size: 1.25rem;
		block-size: 1.25rem;
		margin: 0;
		padding: 0 0.3125rem;
		border: 0;
		border-radius: 999px;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-xs);
		color: var(--branch);
		font: 600 0.6875rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
		cursor: pointer;
	}
	/* A bigger target than it looks, for fingers. */
	.toggle::after {
		content: '';
		position: absolute;
		inset: -0.625rem;
	}
	.toggle.closed {
		background: var(--branch);
		color: var(--ui-surface);
	}
	.tools {
		position: absolute;
		inset-block-end: 0.75rem;
		inset-inline-end: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.125rem;
		padding: 0.25rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface-overlay);
		box-shadow: var(--ui-shadow-overlay);
	}
	.zoom {
		min-inline-size: 3rem;
		color: var(--ui-muted);
		font: 0.75rem/1 var(--ui-font-mono);
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.layer.smooth {
			transition: none;
		}
	}
</style>
