<script lang="ts" module>
	export interface BoardCard {
		id: string;
		title: string;
		/** Ids of the board's labels. */
		labels?: string[];
	}
	export interface BoardColumn {
		id: string;
		title: string;
		cards: BoardCard[];
	}
	export interface BoardLabel {
		id: string;
		name: string;
		/** Any CSS colour; the system's tokens by default. */
		color: string;
	}
</script>

<script lang="ts">
	import { pop, reduced, reflow } from '#lib/ui/motion.js';
	import { flushSync, tick } from 'svelte';
	import { Add01Icon, DragDropVerticalIcon } from '@hugeicons/core-free-icons';
	import { announce } from '#lib/ui/announce.js';
	import Button from '#lib/ui/Button.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import Input from '#lib/ui/Input.svelte';
	import { optimistic } from '#lib/ui/optimistic.js';
	import { scrollEdges } from '#lib/ui/scroll-edges.js';
	import { toast } from '#lib/ui/toast/index.js';
	import Sortable from '#lib/ui/Sortable.svelte';

	interface Props {
		columns: BoardColumn[];
		labels?: BoardLabel[];
		label?: string;
		/** Save where a card was dropped. It moves at once; if this rejects, it goes back. */
		onmove?: (card: BoardCard, to: { column: string; index: number }) => Promise<void> | void;
		class?: string;
	}

	let {
		columns = $bindable(),
		labels = [],
		label = 'Board',
		onmove,
		class: className
	}: Props = $props();

	const uid = $props.id();
	const labelOf = (id: string) => labels.find((l) => l.id === id);

	function locate(cardId: string): [number, number] {
		for (let c = 0; c < columns.length; c++) {
			const i = columns[c].cards.findIndex((k) => k.id === cardId);
			if (i >= 0) return [c, i];
		}
		return [-1, -1];
	}
	function moveCard(cardId: string, toCol: number, toIndex: number) {
		const [c, i] = locate(cardId);
		if (c < 0 || (c === toCol && i === toIndex)) return;
		const [card] = columns[c].cards.splice(i, 1);
		columns[toCol].cards.splice(Math.min(toIndex, columns[toCol].cards.length), 0, card);
	}
	// A card was dropped: it's already in place, so only the save is left. If that fails it goes
	// back to where it was picked up.
	async function dropped(id: string) {
		const c0 = before.findIndex((col) => col.cards.some((k) => k.id === id));
		const i0 = before[c0]?.cards.findIndex((k) => k.id === id);
		const [c, i] = locate(id);
		if (c < 0 || (c === c0 && i === i0)) return;
		const card = columns[c].cards[i];
		const saved = await optimistic(
			() => {},
			onmove && (() => onmove(card, { column: columns[c].id, index: i })),
			() => moveCard(id, c0, i0)
		);
		if (!saved)
			toast.error(`“${card.title}” couldn’t be moved`, {
				description: 'It’s back where it was. Try again in a moment.'
			});
	}
	const where = (cardId: string) => {
		const [c, i] = locate(cardId);
		return `${columns[c].title}, position ${i + 1} of ${columns[c].cards.length}`;
	};
	// The live copy: a card that just left a list is still fading out there (inert) for a moment.
	const cardNode = (id: string) =>
		[
			...document.querySelectorAll<HTMLElement>(
				`[data-board="${uid}"] [data-card="${CSS.escape(id)}"]`
			)
		].find((n) => !n.closest('[inert]'));

	// Snapshot for Escape: the whole board as it was when the card was picked up.
	let before: BoardColumn[] = [];
	const snapshot = () => columns.map((c) => ({ ...c, cards: [...c.cards] }));

	// ----- Pointer: a floating copy follows the pointer; the card's slot moves through the lists.
	let press:
		| { id: string; x: number; y: number; el: HTMLElement; timer?: ReturnType<typeof setTimeout> }
		| undefined;
	let drag = $state<{
		id: string;
		x: number;
		y: number;
		grabX: number;
		grabY: number;
		w: number;
	}>();
	let ghost = $state<HTMLElement>();
	let suppressClick = false;

	function down(e: PointerEvent, id: string) {
		if (e.button !== 0 || drag || picked) return;
		press = { id, x: e.clientX, y: e.clientY, el: e.currentTarget as HTMLElement };
		if (e.pointerType === 'touch') {
			// On touch, press and hold picks a card up; a swipe before that scrolls as usual.
			press.timer = setTimeout(() => begin(e), 220);
			press.el.addEventListener('touchmove', hold, { passive: false });
		}
		addEventListener('pointermove', move);
		addEventListener('pointerup', up);
		addEventListener('pointercancel', up);
	}
	const hold = (e: TouchEvent) => drag && e.preventDefault();

	function begin(e: PointerEvent) {
		if (!press) return;
		clearTimeout(press.timer);
		press.timer = undefined;
		const r = press.el.getBoundingClientRect();
		before = snapshot();
		drag = {
			id: press.id,
			x: e.clientX,
			y: e.clientY,
			grabX: e.clientX - r.left,
			grabY: e.clientY - r.top,
			w: r.width
		};
		navigator.vibrate?.(8);
		announce(
			`Picked up ${columns[locate(press.id)[0]].cards[locate(press.id)[1]].title}.`,
			'assertive'
		);
	}

	function move(e: PointerEvent) {
		if (!press) return;
		if (!drag) {
			if (
				Math.hypot(e.clientX - press.x, e.clientY - press.y) < (e.pointerType === 'touch' ? 8 : 4)
			)
				return;
			if (press.timer) return release();
			begin(e);
		}
		e.preventDefault();
		drag!.x = e.clientX;
		drag!.y = e.clientY;
		scrollNear(e);
		// The list under the pointer, then the gap between its cards nearest the pointer.
		const lists = [...document.querySelectorAll<HTMLElement>(`[data-board="${uid}"] [data-list]`)];
		const col = lists.findIndex((l) => {
			const r = l.closest('.column')!.getBoundingClientRect();
			return e.clientX >= r.left && e.clientX <= r.right;
		});
		if (col < 0) return;
		const others = [...lists[col].querySelectorAll<HTMLElement>('[data-card]')].filter(
			(n) => n.dataset.card !== drag!.id
		);
		const index = others.filter((n) => {
			const r = n.getBoundingClientRect();
			return r.top + r.height / 2 < e.clientY;
		}).length;
		moveCard(drag!.id, Number(lists[col].dataset.list), index);
	}

	// Near the board's sides (or a list's top and bottom) while dragging, they scroll.
	function scrollNear(e: PointerEvent) {
		const board = document.querySelector<HTMLElement>(`[data-board="${uid}"] .sortable`);
		if (board) {
			const r = board.getBoundingClientRect();
			board.scrollLeft += e.clientX < r.left + 48 ? -10 : e.clientX > r.right - 48 ? 10 : 0;
		}
		const list = (
			document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
		)?.closest<HTMLElement>('[data-list]');
		if (list) {
			const r = list.getBoundingClientRect();
			list.scrollTop += e.clientY < r.top + 32 ? -8 : e.clientY > r.bottom - 32 ? 8 : 0;
		}
	}

	async function up(e: PointerEvent) {
		if (drag) {
			suppressClick = true;
			const id = drag.id;
			if (e.type === 'pointercancel') {
				columns = before;
				announce('Move canceled.', 'assertive');
			} else {
				announce(`Dropped in ${where(id)}.`, 'assertive');
				dropped(id);
			}
			// The floating copy flies into the card's slot, then hands over to it.
			const from = ghost?.getBoundingClientRect();
			await tick();
			const to = cardNode(id)?.getBoundingClientRect();
			if (ghost && from && to && !reduced()) {
				await ghost.animate(
					[
						{ transform: `translate(${from.left}px, ${from.top}px) rotate(2deg)` },
						{ transform: `translate(${to.left}px, ${to.top}px)` }
					],
					{ duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' }
				).finished;
			}
			drag = undefined;
		}
		release();
	}
	function release() {
		if (press?.timer) clearTimeout(press.timer);
		press?.el.removeEventListener('touchmove', hold);
		press = undefined;
		removeEventListener('pointermove', move);
		removeEventListener('pointerup', up);
		removeEventListener('pointercancel', up);
	}

	// ----- Keyboard: Space picks up; arrows move within a list and across lists; Space drops.
	let picked = $state<string>();
	function keys(e: KeyboardEvent, id: string) {
		if (e.key === ' ') {
			e.preventDefault();
			if (picked === id) {
				picked = undefined;
				announce(`Dropped in ${where(id)}.`, 'assertive');
				dropped(id);
			} else if (!picked) {
				before = snapshot();
				picked = id;
				announce(
					`Picked up. ${where(id)}. Up and Down move it in the list, Left and Right to the next list, Space drops, Escape puts it back.`,
					'assertive'
				);
			}
			return;
		}
		if (picked !== id) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			flushSync(() => {
				columns = before;
				picked = undefined;
			});
			cardNode(id)?.focus();
			announce('Put back.', 'assertive');
			return;
		}
		const [c, i] = locate(id);
		const rtl = getComputedStyle(e.currentTarget as Element).direction === 'rtl';
		const step = {
			ArrowUp: [0, -1],
			ArrowDown: [0, 1],
			ArrowLeft: [rtl ? 1 : -1, 0],
			ArrowRight: [rtl ? -1 : 1, 0]
		}[e.key];
		if (!step) return;
		e.preventDefault();
		const toCol = c + step[0];
		const toIndex = step[0] ? Math.min(i, columns[toCol]?.cards.length ?? 0) : i + step[1];
		if (
			toCol < 0 ||
			toCol >= columns.length ||
			toIndex < 0 ||
			toIndex >= columns[toCol].cards.length + (step[0] ? 1 : 0)
		)
			return;
		// Applied and refocused at once, so quick presses are never lost.
		flushSync(() => moveCard(id, toCol, toIndex));
		cardNode(id)?.focus();
		announce(where(id), 'assertive');
	}

	// ----- Adding cards, Trello-style: the box stays open for the next one.
	let adding = $state<string>();
	let draft = $state('');
	function add(col: BoardColumn) {
		const title = draft.trim();
		if (!title) return;
		col.cards.push({ id: crypto.randomUUID(), title });
		draft = '';
		announce(`Added to ${col.title}.`);
	}

	// ----- Editing a card.
	let editing = $state<BoardCard>();
	let open = $state(false);
	let editTitle = $state('');
	function openCard(card: BoardCard) {
		if (suppressClick) return void (suppressClick = false);
		editing = card;
		editTitle = card.title;
		open = true;
	}
	function toggleLabel(id: string) {
		if (!editing) return;
		const has = editing.labels?.includes(id);
		editing.labels = has
			? editing.labels!.filter((l) => l !== id)
			: [...(editing.labels ?? []), id];
	}
</script>

{#snippet body(card: BoardCard)}
	{#if card.labels?.length}
		<span class="labels">
			{#each card.labels as l (l)}
				{@const lab = labelOf(l)}
				{#if lab}<span class="tag" style:--c={lab.color}>{lab.name}</span>{/if}
			{/each}
		</span>
	{/if}
	<span class="title">{card.title}</span>
{/snippet}

<section class={['board', drag && 'dragging', className]} aria-label={label} data-board={uid}>
	<Sortable
		bind:items={columns}
		key={(c) => c.id}
		itemLabel={(c) => `the ${c.title} list`}
		label="Lists"
		layout="row"
		class="lists"
	>
		{#snippet children(column, handle, { index: ci })}
			<div class="column">
				<header>
					<button type="button" class="grip" {...handle}
						><Icon icon={DragDropVerticalIcon} size={16} /></button
					>
					<h3>{column.title}</h3>
					<span class="count" aria-hidden="true">{column.cards.length}</span>
				</header>
				<ul
					class="cards"
					data-list={ci}
					aria-label="{column.title}, {column.cards.length} cards"
					{@attach scrollEdges}
					data-fade
				>
					{#each column.cards as card (card.id)}
						<li animate:reflow out:pop>
							<button
								type="button"
								class={['card', drag?.id === card.id && 'slot', picked === card.id && 'picked']}
								data-card={card.id}
								aria-describedby="{uid}-how"
								aria-pressed={picked === card.id}
								onpointerdown={(e) => down(e, card.id)}
								onkeydown={(e) => keys(e, card.id)}
								onkeyup={(e) => e.key === ' ' && e.preventDefault()}
								onclick={() => openCard(card)}
							>
								{@render body(card)}
							</button>
						</li>
					{/each}
				</ul>
				{#if adding === column.id}
					<form
						class="composer"
						onsubmit={(e) => {
							e.preventDefault();
							add(column);
						}}
					>
						<!-- svelte-ignore a11y_autofocus -->
						<textarea
							bind:value={draft}
							rows="2"
							aria-label="New card in {column.title}"
							placeholder="What needs doing?"
							autofocus
							onkeydown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
									e.preventDefault();
									add(column);
								} else if (e.key === 'Escape') adding = undefined;
							}}></textarea>
						<div class="composer-row">
							<Button type="submit" size="sm">Add card</Button>
							<Button variant="ghost" size="sm" onclick={() => (adding = undefined)}>Done</Button>
						</div>
					</form>
				{:else}
					<button
						type="button"
						class="add"
						onclick={() => {
							draft = '';
							adding = column.id;
						}}
					>
						<Icon icon={Add01Icon} size={16} /> Add a card
					</button>
				{/if}
			</div>
		{/snippet}
	</Sortable>
	<p id="{uid}-how" class="sr-only">
		Press Space to pick up. Arrows move it, Space drops it, Escape puts it back. Enter opens the
		card.
	</p>

	{#if drag}
		{@const [c, i] = locate(drag.id)}
		{@const card = columns[c]?.cards[i]}
		{#if card}
			<div
				bind:this={ghost}
				class="card ghost"
				aria-hidden="true"
				style:inline-size="{drag.w}px"
				style:transform="translate({drag.x - drag.grabX}px, {drag.y - drag.grabY}px) rotate(2deg)"
			>
				{@render body(card)}
			</div>
		{/if}
	{/if}
</section>

<Dialog bind:open title="Card">
	{#if editing}
		<div class="edit">
			<Input
				label="Title"
				bind:value={editTitle}
				onchange={() => editTitle.trim() && editing && (editing.title = editTitle.trim())}
			/>
			{#if labels.length}
				<fieldset>
					<legend>Labels</legend>
					<div class="label-choices">
						{#each labels as l (l.id)}
							<button
								type="button"
								class="tag choice"
								style:--c={l.color}
								aria-pressed={!!editing.labels?.includes(l.id)}
								onclick={() => toggleLabel(l.id)}>{l.name}</button
							>
						{/each}
					</div>
				</fieldset>
			{/if}
		</div>
	{/if}
	{#snippet footer()}
		<Button
			variant="danger"
			class="delete"
			onclick={() => {
				if (!editing) return;
				const [c, i] = locate(editing.id);
				const name = editing.title;
				columns[c].cards.splice(i, 1);
				open = false;
				announce(`${name} deleted.`);
			}}>Delete card</Button
		>
		<Button
			onclick={() => {
				if (editing && editTitle.trim()) editing.title = editTitle.trim();
				open = false;
			}}>Done</Button
		>
	{/snippet}
</Dialog>

<style>
	.board {
		inline-size: 100%;
	}
	.board :global(.lists) {
		--sortable-gap: 0.75rem;
		align-items: flex-start;
		padding-block-end: 0.5rem;
	}
	.dragging {
		cursor: grabbing;
		user-select: none;
		-webkit-user-select: none;
	}
	/* Concentric: 1.25rem list = 0.5rem padding + the cards' 0.75rem. */
	.column {
		display: flex;
		flex-direction: column;
		inline-size: 17rem;
		max-block-size: 32rem;
		padding: 0.5rem;
		box-sizing: border-box;
		border-radius: 1.25rem;
		background: var(--ui-subtle);
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding-block: 0.25rem 0.5rem;
		padding-inline: 0.125rem 0.5rem;
	}
	.grip {
		display: grid;
		place-items: center;
		inline-size: 1.75rem;
		block-size: 1.75rem;
		padding: 0;
		border: 0;
		border-radius: var(--ui-radius);
		background: none;
		color: var(--ui-muted);
	}
	.grip:hover {
		background: var(--ui-hover);
		color: var(--ui-fg);
	}
	h3 {
		flex: 1;
		margin: 0;
		font: 600 0.875rem/1.3 var(--ui-font);
	}
	.count {
		color: var(--ui-muted);
		font: 500 0.8125rem/1 var(--ui-font);
		font-variant-numeric: tabular-nums;
	}
	.cards {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-block-size: 2.5rem;
		margin: 0;
		padding: 2px;
		overflow-y: auto;
		overscroll-behavior: contain;
		list-style: none;
	}
	.card {
		display: grid;
		gap: 0.375rem;
		inline-size: 100%;
		padding: 0.625rem 0.75rem;
		border: 0;
		border-radius: 0.75rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
		color: var(--ui-fg);
		font: 0.875rem/1.4 var(--ui-font);
		text-align: start;
		cursor: grab;
		touch-action: pan-x pan-y;
		-webkit-touch-callout: none;
		user-select: none;
		-webkit-user-select: none;
		transition:
			box-shadow var(--ui-dur) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	.card:hover {
		box-shadow:
			var(--ui-shadow-card),
			0 0 0 1px var(--ui-field-line);
	}
	.card:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	/* Where the dragged card will land: its shape, tinted. */
	.slot {
		background: color-mix(in srgb, var(--ui-accent) 10%, transparent);
		box-shadow: none;
	}
	.slot > :global(*) {
		visibility: hidden;
	}
	/* Picked up from the keyboard: lifted in place. */
	.picked {
		transform: rotate(-1.5deg) scale(1.02);
		box-shadow: var(--ui-shadow-overlay);
	}
	.ghost {
		position: fixed;
		inset: 0 auto auto 0;
		z-index: 50;
		box-shadow: var(--ui-shadow-overlay);
		pointer-events: none;
		cursor: grabbing;
	}
	.labels {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}
	.tag {
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--c) 16%, transparent);
		color: var(--ui-fg);
		font: 600 0.6875rem/1.4 var(--ui-font);
	}
	.title {
		overflow-wrap: anywhere;
	}
	.add {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-block-start: 0.5rem;
		padding: 0.5rem 0.625rem;
		border: 0;
		border-radius: 0.75rem;
		background: none;
		color: var(--ui-muted);
		font: 500 0.875rem/1 var(--ui-font);
		cursor: pointer;
		transition: background var(--ui-dur) ease;
	}
	.add:hover {
		background: var(--ui-hover);
		color: var(--ui-fg);
	}
	:is(.grip, .add, .choice):focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.composer {
		display: grid;
		gap: 0.5rem;
		margin-block-start: 0.5rem;
	}
	.composer textarea {
		box-sizing: border-box;
		inline-size: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--ui-field-line);
		border-radius: 0.75rem;
		background: var(--ui-surface);
		color: inherit;
		font: 0.875rem/1.4 var(--ui-font);
		font-size: max(0.875rem, 16px);
		resize: none;
		field-sizing: content;
	}
	@media (pointer: fine) {
		.composer textarea {
			font-size: 0.875rem;
		}
	}
	.composer textarea:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.composer-row {
		display: flex;
		gap: 0.25rem;
	}
	.edit {
		display: grid;
		gap: 1rem;
	}
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-block-end: 0.5rem;
		padding: 0;
		font: 500 0.875rem/1.3 var(--ui-font);
	}
	.label-choices {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}
	.choice {
		border: 0;
		cursor: pointer;
		opacity: 0.55;
		font-size: 0.8125rem;
		padding: 0.3125rem 0.75rem;
		transition: opacity var(--ui-dur) ease;
	}
	.choice[aria-pressed='true'] {
		opacity: 1;
		box-shadow: inset 0 0 0 1.5px var(--c);
	}
	:global(.btn.delete) {
		margin-inline-end: auto;
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
		.card,
		.picked {
			transition: none;
			transform: none;
		}
	}
</style>
