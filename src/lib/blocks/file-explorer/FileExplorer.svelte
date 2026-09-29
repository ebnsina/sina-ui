<script lang="ts" module>
	export type FileKind = 'pdf' | 'image' | 'doc' | 'sheet' | 'audio' | 'video' | 'code' | 'other';
	export interface ExplorerItem {
		id: string;
		name: string;
		/** A folder holds items; everything else is a file. */
		folder?: boolean;
		/** The folder it's in; null at the top. */
		parent: string | null;
		kind?: FileKind;
		/** Bytes. */
		size?: number;
		/** ISO date of the last change. */
		modified: string;
		/** A folder's colour. */
		color?: string;
		starred?: boolean;
		/** In the Trash: hidden everywhere else, with everything inside it. */
		trashed?: boolean;
		/** An image URL shown as the file's preview. */
		thumbnail?: string;
	}
	/** Every change people make, so it can be saved: reject and it's put back. */
	export type ExplorerChange =
		| { type: 'create'; item: ExplorerItem }
		| { type: 'move'; items: ExplorerItem[]; to: string | null }
		| { type: 'rename'; item: ExplorerItem; name: string }
		| { type: 'star'; item: ExplorerItem; starred: boolean }
		| { type: 'trash'; items: ExplorerItem[]; trashed: boolean }
		| { type: 'delete'; items: ExplorerItem[] };
</script>

<script lang="ts">
	import {
		ArrowDown01Icon,
		ArrowUp01Icon,
		Cancel01Icon,
		Clock01Icon,
		Delete02Icon,
		File02Icon,
		Folder01Icon,
		FolderAddIcon,
		Home01Icon,
		Image01Icon,
		InformationCircleIcon,
		MoreHorizontalIcon,
		MusicNote01Icon,
		Pdf01Icon,
		PencilEdit02Icon,
		RestoreBinIcon,
		SourceCodeIcon,
		StarIcon,
		Table01Icon,
		Tick02Icon,
		Upload04Icon,
		Video01Icon
	} from '@hugeicons/core-free-icons';
	import { untrack } from 'svelte';
	import { fly, slide } from 'svelte/transition';
	import AlertDialog from '#lib/ui/AlertDialog.svelte';
	import { announce } from '#lib/ui/announce.js';
	import { arrowTarget } from '#lib/ui/arrow-nav.js';
	import Breadcrumb from '#lib/ui/Breadcrumb.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Dialog from '#lib/ui/Dialog.svelte';
	import * as Dropdown from '#lib/ui/dropdown/index.js';
	import EmptyState from '#lib/ui/EmptyState.svelte';
	import FileTree, { type TreeNode } from '#lib/ui/FileTree.svelte';
	import Folder from '#lib/ui/Folder.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { inView } from '#lib/ui/in-view.js';
	import Input from '#lib/ui/Input.svelte';
	import Meter from '#lib/ui/Meter.svelte';
	import { ms, pop, reflow } from '#lib/ui/motion.js';
	import { optimistic } from '#lib/ui/optimistic.js';
	import SearchField from '#lib/ui/SearchField.svelte';
	import Segmented from '#lib/ui/Segmented.svelte';
	import { createSelection } from '#lib/ui/selection.svelte.js';
	import SidebarLayout, { type SidebarGroup } from '#lib/ui/SidebarLayout.svelte';
	import { toast } from '#lib/ui/toast/index.js';
	import UploadTray from '#lib/ui/UploadTray.svelte';
	import { createUploads, type Send } from '#lib/ui/uploads.svelte.js';

	interface Props {
		items: ExplorerItem[];
		/** Bytes allowed in all. */
		quota?: number;
		locale?: string;
		/** Save a change. It shows at once; if this rejects, it's put back and people are told. */
		onchange?: (change: ExplorerChange) => Promise<void> | void;
		/** Uploads each file with progress in a tray; a file appears once it's sent. */
		send?: Send;
		/** A file was opened (double-click or Enter). */
		onopen?: (item: ExplorerItem) => void;
	}

	let {
		items = $bindable(),
		quota = 15e9,
		locale = 'en',
		onchange,
		send,
		onopen
	}: Props = $props();

	const uid = $props.id();
	type Place = 'home' | 'recent' | 'starred' | 'trash';
	type SortKey = 'name' | 'modified' | 'size';
	const PAGE = 120;
	let place = $state<Place>('home');
	let here = $state<string | null>(null);
	let view = $state<'grid' | 'list'>('grid');
	let query = $state('');
	let details = $state(false);
	let sort = $state<{ by: SortKey; dir: 1 | -1 }>({ by: 'name', dir: 1 });

	const index = $derived(new Map(items.map((i) => [i.id, i])));
	const byId = (id: string | null | undefined) => (id == null ? undefined : index.get(id));
	const alive = (i: ExplorerItem) => {
		for (let f: ExplorerItem | undefined = i; f; f = byId(f.parent)) if (f.trashed) return false;
		return true;
	};
	const live = $derived(items.filter(alive));
	const counts = $derived.by(() => {
		const m = new Map<string | null, number>();
		for (const i of items) if (!i.trashed) m.set(i.parent, (m.get(i.parent) ?? 0) + 1);
		return m;
	});
	const trailOf = (id: string | null) => {
		const path: ExplorerItem[] = [];
		for (let f = byId(id); f; f = byId(f.parent)) path.unshift(f);
		return path;
	};
	const trail = $derived(trailOf(here));
	const q = $derived(query.trim().toLowerCase());

	const collator = $derived(new Intl.Collator(locale, { numeric: true, sensitivity: 'base' }));
	const compare = (a: ExplorerItem, b: ExplorerItem) =>
		sort.dir *
			(sort.by === 'name'
				? collator.compare(a.name, b.name)
				: sort.by === 'size'
					? (a.size ?? 0) - (b.size ?? 0)
					: a.modified.localeCompare(b.modified)) || collator.compare(a.name, b.name);

	// Everything in this place, folders first; only the first `limit` are drawn.
	const shown = $derived.by(() => {
		let list =
			place === 'trash'
				? items.filter((i) => i.trashed)
				: place === 'recent'
					? live
							.filter((i) => !i.folder)
							.sort((a, b) => b.modified.localeCompare(a.modified))
							.slice(0, 12)
					: place === 'starred'
						? live.filter((i) => i.starred)
						: q
							? live
							: live.filter((i) => i.parent === here);
		if (q) list = list.filter((i) => i.name.toLowerCase().includes(q));
		list = list.toSorted(compare);
		return [...list.filter((i) => i.folder), ...list.filter((i) => !i.folder)];
	});
	let limit = $state(PAGE);
	const visible = $derived(shown.slice(0, limit));
	const folders = $derived(visible.filter((i) => i.folder));
	const files = $derived(visible.filter((i) => !i.folder));
	const used = $derived(items.reduce((sum, i) => sum + (i.size ?? 0), 0));

	const bytes = (n = 0) => {
		const [v, unit] =
			n >= 1e9 ? [n / 1e9, 'gigabyte'] : n >= 1e6 ? [n / 1e6, 'megabyte'] : [n / 1e3, 'kilobyte'];
		return new Intl.NumberFormat(locale, { style: 'unit', unit, maximumFractionDigits: 1 }).format(
			v
		);
	};
	const number = $derived(new Intl.NumberFormat(locale));
	const itemCount = (n = 0) => `${number.format(n)} ${n === 1 ? 'item' : 'items'}`;
	const date = $derived(new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }));
	const longDate = $derived(
		new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })
	);
	const kinds: Record<FileKind, { icon: typeof File02Icon; color: string; label: string }> = {
		pdf: { icon: Pdf01Icon, color: '#dc2626', label: 'PDF' },
		image: { icon: Image01Icon, color: '#0891b2', label: 'Image' },
		doc: { icon: File02Icon, color: '#2563eb', label: 'Document' },
		sheet: { icon: Table01Icon, color: '#16a34a', label: 'Spreadsheet' },
		audio: { icon: MusicNote01Icon, color: '#9333ea', label: 'Audio' },
		video: { icon: Video01Icon, color: '#ea580c', label: 'Video' },
		code: { icon: SourceCodeIcon, color: '#475569', label: 'Code' },
		other: { icon: File02Icon, color: '#64748b', label: 'File' }
	};
	const kindOf = (i: ExplorerItem) =>
		i.folder
			? { icon: Folder01Icon, color: i.color ?? 'var(--ui-accent)', label: 'Folder' }
			: kinds[i.kind ?? 'other'];
	const named = (list: ExplorerItem[]) =>
		list.length === 1 ? list[0].name : `${number.format(list.length)} items`;

	const picked = createSelection(
		() => shown,
		(i) => i.id
	);
	let active = $state<string>();
	const focusable = $derived(visible.some((i) => i.id === active) ? active : visible[0]?.id);
	const selection = $derived(picked.items);
	const targets = (i: ExplorerItem) => (picked.has(i) ? selection : [i]);
	function choose(e: MouseEvent | KeyboardEvent, i: ExplorerItem) {
		picked.choose(i, e);
		active = i.id;
	}
	const toggle = (i: ExplorerItem) => {
		picked.toggle(i);
		active = i.id;
	};

	// Somewhere new starts at the top, with nothing chosen.
	$effect.pre(() => {
		void [place, here, q];
		limit = PAGE;
		untrack(() => picked.clear());
	});

	let expanded = $state<string[]>([]);
	function go(id: string | null) {
		place = 'home';
		here = id;
		query = '';
		const up = trailOf(id).map((f) => f.id);
		expanded = [...new Set([...expanded, ...up.slice(0, -1)])];
		announce(`Opened ${byId(id)?.name ?? 'Home'}`);
	}
	function open(i: ExplorerItem) {
		if (place === 'trash') return;
		if (i.folder) go(i.id);
		else onopen?.(i);
	}

	// Shown at once, then saved; a failed save puts the touched items back as they were.
	async function commit(
		change: ExplorerChange,
		touched: ExplorerItem[],
		apply: () => void,
		revert?: () => void
	) {
		const before = touched.map((i) => $state.snapshot(i));
		const undo = revert ?? (() => before.forEach((s) => Object.assign(byId(s.id) ?? {}, s)));
		if (!(await optimistic(apply, onchange && (() => onchange(change)), undo)))
			toast.error('That change couldn’t be saved', {
				description: 'It’s been put back. Try again in a moment.'
			});
	}

	// Moving: drag onto a folder, its menu, the selection bar, or ⌘X then ⌘V.
	let over = $state<string>();
	let dragging: ExplorerItem[] = [];
	let clip = $state<string[]>([]);
	const within = (folder: string | null, id: string) => {
		for (let f = byId(folder); f; f = byId(f.parent)) if (f.id === id) return true;
		return false;
	};
	function moveTo(list: ExplorerItem[], to: string | null, undoable = true) {
		// A folder can't go inside itself or anything within it.
		const ok = list.filter((i) => i.parent !== to && !within(to, i.id));
		if (!ok.length) return;
		const from = ok.map((i) => [i, i.parent] as const);
		const now = new Date().toISOString();
		commit({ type: 'move', items: ok, to }, ok, () =>
			ok.forEach((i) => ((i.parent = to), (i.modified = now)))
		);
		picked.clear();
		const where = byId(to)?.name ?? 'Home';
		if (!undoable) return announce(`Moved back`);
		toast(`Moved ${named(ok)} to ${where}`, {
			action: {
				label: 'Undo',
				onclick: () => {
					for (const p of new Set(from.map(([, p]) => p)))
						moveTo(
							from.filter(([, q]) => q === p).map(([i]) => i),
							p,
							false
						);
				}
			}
		});
	}
	const destinations = (list: ExplorerItem[]) =>
		[{ id: null as string | null, name: 'Home' }, ...live.filter((i) => i.folder)].filter(
			(f) => !list.some((i) => within(f.id, i.id)) && !list.every((i) => i.parent === f.id)
		);
	function paste() {
		const list = clip.map(byId).filter((i) => i && alive(i)) as ExplorerItem[];
		clip = [];
		moveTo(list, place === 'home' ? here : null);
	}

	// Rename and new folder share one dialog; `naming` is unset for a new folder.
	let naming = $state<ExplorerItem>();
	let draft = $state('');
	let nameOpen = $state(false);
	const rename = (i?: ExplorerItem) => {
		naming = i;
		draft = i?.name ?? 'Untitled folder';
		nameOpen = true;
	};
	function saveName(e: SubmitEvent) {
		e.preventDefault();
		const name = draft.trim();
		const now = new Date().toISOString();
		const i = naming;
		nameOpen = false;
		if (!name) return;
		if (i) {
			if (name !== i.name)
				commit({ type: 'rename', item: i, name }, [i], () => ((i.name = name), (i.modified = now)));
		} else {
			const f: ExplorerItem = {
				id: crypto.randomUUID(),
				name,
				folder: true,
				parent: place === 'home' ? here : null,
				modified: now
			};
			commit(
				{ type: 'create', item: f },
				[],
				() => items.push(f),
				() => (items = items.filter((x) => x.id !== f.id))
			);
			announce(`${name} created`);
		}
	}
	const star = (i: ExplorerItem) =>
		commit({ type: 'star', item: i, starred: !i.starred }, [i], () => (i.starred = !i.starred));

	// Deleting sends to the Trash, undoable; only emptying it is for good, and that asks first.
	function trash(list: ExplorerItem[]) {
		if (!list.length) return;
		commit({ type: 'trash', items: list, trashed: true }, list, () =>
			list.forEach((i) => (i.trashed = true))
		);
		picked.clear();
		toast(`Moved ${named(list)} to Trash`, {
			action: { label: 'Undo', onclick: () => restore(list) }
		});
	}
	function restore(list: ExplorerItem[]) {
		commit({ type: 'trash', items: list, trashed: false }, list, () =>
			list.forEach((i) => {
				i.trashed = false;
				// Its folder is gone or in the Trash too: it comes back to Home.
				const p = byId(i.parent);
				if (i.parent && (!p || !alive(p))) i.parent = null;
			})
		);
		picked.clear();
		announce(`Restored ${named(list)}`);
	}
	let doomed = $state<ExplorerItem[]>([]);
	let doomOpen = $state(false);
	const askDelete = (list: ExplorerItem[]) => {
		doomed = list;
		doomOpen = list.length > 0;
	};
	function destroy() {
		const gone = new Set<string>();
		// ponytail: rescans items per folder, fine to tens of thousands; index children if it slows.
		const mark = (id: string) => {
			gone.add(id);
			for (const i of items) if (i.parent === id && !gone.has(i.id)) mark(i.id);
		};
		doomed.forEach((i) => mark(i.id));
		const removed = items.filter((i) => gone.has(i.id));
		commit(
			{ type: 'delete', items: removed },
			[],
			() => (items = items.filter((i) => !gone.has(i.id))),
			() => items.push(...removed)
		);
		picked.clear();
		announce(`Deleted ${named(doomed)} for good`);
	}

	// Uploads: the button, or files dropped from the computer anywhere on the explorer.
	let picker = $state<HTMLInputElement>();
	let dropping = $state(false);
	const kindFrom = (type: string, name: string): FileKind =>
		type === 'application/pdf'
			? 'pdf'
			: type.startsWith('image/')
				? 'image'
				: type.startsWith('audio/')
					? 'audio'
					: type.startsWith('video/')
						? 'video'
						: /\.(csv|xlsx?)$/i.test(name)
							? 'sheet'
							: /\.(ts|js|svelte|json|py|go)$/i.test(name)
								? 'code'
								: /\.(docx?|md|txt)$/i.test(name)
									? 'doc'
									: 'other';
	function add(f: File, parent: string | null) {
		const kind = kindFrom(f.type, f.name);
		items.push({
			id: crypto.randomUUID(),
			name: f.name,
			parent,
			kind,
			size: f.size,
			modified: new Date().toISOString(),
			// ponytail: object URLs live as long as the page; revoke them if files come and go a lot.
			thumbnail: kind === 'image' ? URL.createObjectURL(f) : undefined
		});
	}
	// With `send`, each file goes up with progress and joins its folder once it's there.
	const dests = new Map<File, string | null>();
	// svelte-ignore state_referenced_locally
	const uploads = send
		? createUploads(async (file, o) => {
				await send(file, o);
				add(file, dests.get(file) ?? null);
			})
		: undefined;
	function upload(list: FileList | null | undefined) {
		if (!list?.length) return;
		const to = place === 'home' ? here : null;
		const chosen = [...list];
		if (uploads) {
			chosen.forEach((f) => dests.set(f, to));
			uploads.add(chosen);
		} else {
			chosen.forEach((f) => add(f, to));
			announce(`${chosen.length} ${chosen.length === 1 ? 'file' : 'files'} added`);
		}
	}

	// Keyboard: arrows move between items as they're laid out, the rest act on the selection.
	let body = $state<HTMLElement>();
	function keys(e: KeyboardEvent) {
		const mod = e.metaKey || e.ctrlKey;
		const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
		if (mod && k === 'v' && clip.length) return (e.preventDefault(), paste());
		const el = (e.target as HTMLElement).closest<HTMLElement>('[data-id]');
		const i = byId(el?.dataset.id);
		if (!el || !i || !body) return;
		const to = arrowTarget(k, el, [...body.querySelectorAll<HTMLElement>('[data-id]')]);
		if (to === null) {
			if (mod && k === 'a') picked.all();
			else if (mod && k === ' ') toggle(i);
			else if (mod && k === 'x' && place !== 'trash') {
				clip = targets(i).map((x) => x.id);
				announce(`${named(targets(i))} ready to move: open a folder and paste`);
			} else if (k === 'Escape' && (picked.size || clip.length)) (picked.clear(), (clip = []));
			else if (k === 'Delete' || k === 'Backspace')
				place === 'trash' ? askDelete(targets(i)) : trash(targets(i));
			else if (k === 'F2' && place !== 'trash') rename(i);
			else if (k === 'Enter') open(i);
			else if (k === 'ContextMenu' || (e.shiftKey && k === 'F10')) menuOf(el)?.click();
			else return;
			e.preventDefault();
			return;
		}
		e.preventDefault();
		const next = byId(to?.dataset.id);
		if (!to || !next) return;
		to.focus();
		if (mod) active = next.id;
		else choose(e, next);
	}

	const menuOf = (el: Element) => el.closest('li')?.querySelector<HTMLElement>('.more');

	// What every item shares, whichever way it's drawn.
	const attrs = (i: ExplorerItem) => ({
		'data-id': i.id,
		tabindex: focusable === i.id ? 0 : -1,
		draggable: place !== 'trash',
		'aria-pressed': picked.has(i),
		onclick: (e: MouseEvent) => choose(e, i),
		ondblclick: () => open(i),
		oncontextmenu: (e: MouseEvent) => {
			e.preventDefault();
			if (!picked.has(i)) choose(e, i);
			menuOf(e.currentTarget as Element)?.click();
		},
		onfocus: () => (active = i.id),
		ondragstart: (e: DragEvent) => {
			dragging = targets(i);
			e.dataTransfer?.setData('text/plain', i.name);
		},
		ondragend: () => ((over = undefined), (dragging = [])),
		...(i.folder && {
			ondragover: (e: DragEvent) => {
				if (!dragging.length || dragging.some((d) => d.id === i.id)) return;
				e.preventDefault();
				over = i.id;
			},
			ondragleave: () => over === i.id && (over = undefined),
			ondrop: (e: DragEvent) => {
				e.preventDefault();
				moveTo(dragging, i.id);
				over = undefined;
				dragging = [];
			}
		})
	});

	// The sidebar's folder tree, kept open to wherever you are.
	const tree = $derived.by(() => {
		const kids = new Map<string | null, ExplorerItem[]>();
		for (const f of live) if (f.folder) kids.set(f.parent, [...(kids.get(f.parent) ?? []), f]);
		const build = (p: string | null): TreeNode[] =>
			(kids.get(p) ?? [])
				.toSorted((a, b) => collator.compare(a.name, b.name))
				.map((f) => ({ id: f.id, name: f.name, children: build(f.id) }));
		return build(null);
	});

	const sortKeys: { key: SortKey; label: string; dirs: [string, string] }[] = [
		{ key: 'name', label: 'Name', dirs: ['A to Z', 'Z to A'] },
		{ key: 'modified', label: 'Modified', dirs: ['oldest first', 'newest first'] },
		{ key: 'size', label: 'Size', dirs: ['smallest first', 'largest first'] }
	];
	const sortBy = (by: SortKey) =>
		(sort = { by, dir: sort.by === by ? (-sort.dir as 1 | -1) : by === 'name' ? 1 : -1 });
	const sortedAs = $derived(sortKeys.find((s) => s.key === sort.by)!.dirs[sort.dir === 1 ? 0 : 1]);

	const groups: SidebarGroup[] = [
		{
			items: [
				{ label: 'Home', href: '#home', icon: Home01Icon },
				{ label: 'Recent', href: '#recent', icon: Clock01Icon },
				{ label: 'Starred', href: '#starred', icon: StarIcon },
				{ label: 'Trash', href: '#trash', icon: Delete02Icon }
			]
		}
	];
	const titles = { home: 'Home', recent: 'Recent', starred: 'Starred', trash: 'Trash' };
	const one = $derived(selection.length === 1 ? selection[0] : undefined);
</script>

{#snippet menu(i: ExplorerItem)}
	<Dropdown.Root>
		{#snippet trigger(props)}
			<Button
				variant="ghost"
				size="sm"
				square
				class="more"
				aria-label="More for {i.name}"
				tabindex={-1}
				{...props}
			>
				<Icon icon={MoreHorizontalIcon} size={16} />
			</Button>
		{/snippet}
		{#if place === 'trash'}
			<Dropdown.Item onselect={() => restore(targets(i))}
				><Icon icon={RestoreBinIcon} /> Restore</Dropdown.Item
			>
			<Dropdown.Separator />
			<Dropdown.Item variant="danger" onselect={() => askDelete(targets(i))}>
				<Icon icon={Delete02Icon} /> Delete forever
			</Dropdown.Item>
		{:else}
			<Dropdown.Item onselect={() => rename(i)}
				><Icon icon={PencilEdit02Icon} /> Rename</Dropdown.Item
			>
			<Dropdown.Item onselect={() => star(i)}>
				<Icon icon={StarIcon} />
				{i.starred ? 'Unstar' : 'Star'}
			</Dropdown.Item>
			<Dropdown.Sub label="Move to">
				{#each destinations(targets(i)) as f (f.id ?? 'root')}
					<Dropdown.Item onselect={() => moveTo(targets(i), f.id)}>{f.name}</Dropdown.Item>
				{/each}
			</Dropdown.Sub>
			<Dropdown.Separator />
			<Dropdown.Item variant="danger" onselect={() => trash(targets(i))}>
				<Icon icon={Delete02Icon} /> Move to Trash
			</Dropdown.Item>
		{/if}
	</Dropdown.Root>
{/snippet}

{#snippet check(i: ExplorerItem)}
	<!-- For touch and screen readers: add to the selection without a modifier key. -->
	<button
		type="button"
		class="check"
		tabindex="-1"
		aria-label="Select {i.name}"
		aria-pressed={picked.has(i)}
		onclick={() => toggle(i)}
	>
		<Icon icon={Tick02Icon} size={12} strokeWidth={2.5} />
	</button>
{/snippet}

{#snippet row(i: ExplorerItem)}
	{@const k = kindOf(i)}
	<button
		type="button"
		class={['row', picked.has(i) && 'selected', over === i.id && 'over']}
		{...attrs(i)}
	>
		<span class="thumb" style:--k={k.color} aria-hidden="true">
			{#if i.thumbnail}<img src={i.thumbnail} alt="" loading="lazy" />{:else}<Icon
					icon={k.icon}
					size={16}
				/>{/if}
		</span>
		<span class="name">{i.name}</span>
		<span class="col-date">{date.format(new Date(i.modified))}</span>
		<span class="col-size">{i.folder ? itemCount(counts.get(i.id)) : bytes(i.size)}</span>
	</button>
{/snippet}

{#snippet card(i: ExplorerItem)}
	{@const k = kindOf(i)}
	<button type="button" class={['card', picked.has(i) && 'selected']} {...attrs(i)}>
		<span class="preview" style:--k={k.color} aria-hidden="true">
			{#if i.thumbnail}<img src={i.thumbnail} alt="" loading="lazy" />{:else}<Icon
					icon={k.icon}
					size={30}
				/>{/if}
		</span>
		<span class="name">{i.name}</span>
		<span class="meta">{k.label} · {bytes(i.size)}</span>
		{#if i.starred}<span class="star" aria-label="Starred"><Icon icon={StarIcon} size={13} /></span
			>{/if}
	</button>
{/snippet}

<div class={['explorer', picked.size && 'picking']}>
	<SidebarLayout
		label="Files"
		{groups}
		current="#{place}"
		onselect={(item) => {
			place = item.href.slice(1) as Place;
			here = null;
			query = '';
		}}
	>
		{#snippet header(collapsed)}
			<span class="brand">{collapsed ? 'F' : 'Files'}</span>
		{/snippet}
		{#snippet footer()}
			{#if tree.length}
				<div class="tree">
					<p class="caption" aria-hidden="true">Folders</p>
					<FileTree
						label="Folders"
						items={tree}
						bind:expanded
						selected={place === 'home' ? (here ?? undefined) : undefined}
						onselect={(n) => go(n.id)}
						height="11rem"
					/>
				</div>
			{/if}
			<div class="storage">
				<Meter
					label="Storage"
					value={used}
					max={quota}
					high={quota * 0.9}
					optimum={0}
					format={(v, _, max) => `${bytes(v)} of ${bytes(max)}`}
				/>
			</div>
		{/snippet}

		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class={['page', dropping && 'dropping']}
			ondragover={(e) => {
				if (!e.dataTransfer?.types.includes('Files') || place === 'trash') return;
				e.preventDefault();
				dropping = true;
			}}
			ondragleave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && (dropping = false)}
			ondrop={(e) => {
				if (!e.dataTransfer?.files.length) return;
				e.preventDefault();
				dropping = false;
				upload(e.dataTransfer.files);
			}}
			onkeydown={keys}
		>
			<header class="top">
				<!-- In-app links: the crumbs move around the explorer rather than leaving the page. -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					class="where"
					onclick={(e) => {
						const href = (e.target as HTMLElement).closest('a')?.getAttribute('href');
						if (!href?.startsWith(`#${uid}-`)) return;
						e.preventDefault();
						const id = href.slice(uid.length + 2);
						go(id === 'root' ? null : id);
					}}
				>
					{#if place === 'home' && !q}
						<Breadcrumb
							label="Folder path"
							items={[
								{ label: 'Home', href: `#${uid}-root` },
								...trail.map((f) => ({ label: f.name, href: `#${uid}-${f.id}` }))
							].map((c, i, all) => (i === all.length - 1 ? { label: c.label } : c))}
						/>
					{:else}
						<h2>{q ? `Results for “${query.trim()}”` : titles[place]}</h2>
					{/if}
				</div>
				<div class="tools">
					<SearchField label="Search files" placeholder="Search" bind:value={query} class="find" />
					<Dropdown.Root>
						{#snippet trigger(props)}
							<Button variant="secondary" {...props}
								>Sort<span class="vh"
									>: {sortKeys.find((s) => s.key === sort.by)?.label}, {sortedAs}</span
								></Button
							>
						{/snippet}
						{#each sortKeys as s (s.key)}
							<Dropdown.Item onselect={() => sortBy(s.key)}>
								<span class="tick" aria-hidden="true"
									>{#if sort.by === s.key}<Icon
											icon={sort.dir === 1 ? ArrowUp01Icon : ArrowDown01Icon}
										/>{/if}</span
								>
								{s.label}{#if sort.by === s.key}<span class="vh">, {sortedAs}</span>{/if}
							</Dropdown.Item>
						{/each}
					</Dropdown.Root>
					<Segmented
						label="View"
						hideLabel
						options={[
							{ value: 'grid', label: 'Grid' },
							{ value: 'list', label: 'List' }
						]}
						bind:value={() => view, (v) => (view = v as typeof view)}
					/>
					<Button
						variant="ghost"
						square
						aria-label="Details"
						aria-pressed={details}
						onclick={() => (details = !details)}
					>
						<Icon icon={InformationCircleIcon} size={18} />
					</Button>
					{#if place === 'trash'}
						<Button
							variant="secondary"
							disabled={!shown.length}
							onclick={() => askDelete(items.filter((i) => i.trashed))}>Empty Trash</Button
						>
					{:else}
						<Dropdown.Root>
							{#snippet trigger(props)}
								<Button {...props}>New</Button>
							{/snippet}
							<Dropdown.Item onselect={() => rename()}
								><Icon icon={FolderAddIcon} /> New folder</Dropdown.Item
							>
							<Dropdown.Item onselect={() => picker?.click()}
								><Icon icon={Upload04Icon} /> Upload files</Dropdown.Item
							>
						</Dropdown.Root>
					{/if}
					<input
						bind:this={picker}
						type="file"
						multiple
						hidden
						onchange={(e) => {
							upload(e.currentTarget.files);
							e.currentTarget.value = '';
						}}
					/>
				</div>
			</header>

			<div class="split">
				<div class="body" bind:this={body}>
					{#if !shown.length}
						<EmptyState
							title={q
								? 'Nothing matches'
								: place === 'trash'
									? 'The Trash is empty'
									: place === 'starred'
										? 'Nothing starred yet'
										: 'This folder is empty'}
							icon={q ? undefined : place === 'trash' ? Delete02Icon : FolderAddIcon}
							level={3}
						>
							{q
								? 'Try another name.'
								: place === 'trash'
									? 'Things you delete wait here until you empty it.'
									: 'Drop files here, or add them with New.'}
						</EmptyState>
					{:else if view === 'list'}
						<div class="cols">
							{#each sortKeys as s (s.key)}
								<button type="button" class={['col', s.key]} onclick={() => sortBy(s.key)}>
									{s.label}
									{#if sort.by === s.key}<Icon
											icon={sort.dir === 1 ? ArrowUp01Icon : ArrowDown01Icon}
											size={14}
										/><span class="vh">, sorted {sortedAs}</span>{/if}
								</button>
							{/each}
						</div>
						<ul class="rows">
							{#each visible as i (i.id)}
								<li class={[clip.includes(i.id) && 'cut']} animate:reflow out:pop>
									{@render row(i)}
									{@render check(i)}
									{@render menu(i)}
								</li>
							{/each}
						</ul>
					{:else}
						{#if folders.length}
							<h3 class="section">Folders</h3>
							<ul class="folders">
								{#each folders as f (f.id)}
									<li
										class={[clip.includes(f.id) && 'cut']}
										animate:reflow
										out:pop={{ start: 0.9 }}
									>
										<Folder
											name={f.name}
											count={counts.get(f.id) ?? 0}
											color={f.color}
											open={over === f.id}
											selected={picked.has(f)}
											{locale}
											{...attrs(f)}
										/>
										{@render check(f)}
										{@render menu(f)}
									</li>
								{/each}
							</ul>
						{/if}
						{#if files.length}
							<h3 class="section">Files</h3>
							<ul class="files">
								{#each files as file (file.id)}
									<li class={[clip.includes(file.id) && 'cut']} animate:reflow out:pop>
										{@render card(file)}
										{@render check(file)}
										{@render menu(file)}
									</li>
								{/each}
							</ul>
						{/if}
					{/if}
					{#if shown.length > limit}
						<!-- Replaced each page, so the observer fires again if it's still in view. -->
						{#key limit}<div
								class="sentinel"
								{@attach inView(() => (limit += PAGE), { rootMargin: '400px' })}
							></div>{/key}
					{/if}
				</div>

				{#if details}
					<aside
						class="details"
						aria-label="Details"
						transition:slide={{ axis: 'x', duration: ms(200) }}
					>
						{#if one}
							{@const k = kindOf(one)}
							<div class="big" style:--k={k.color}>
								{#if one.thumbnail}<img src={one.thumbnail} alt="" />{:else}<Icon
										icon={k.icon}
										size={48}
									/>{/if}
							</div>
							<h3>{one.name}</h3>
							<dl>
								<dt>Kind</dt>
								<dd>{k.label}</dd>
								<dt>{one.folder ? 'Holds' : 'Size'}</dt>
								<dd>{one.folder ? itemCount(counts.get(one.id)) : bytes(one.size)}</dd>
								<dt>Modified</dt>
								<dd>{longDate.format(new Date(one.modified))}</dd>
								<dt>Location</dt>
								<dd>{['Home', ...trailOf(one.parent).map((f) => f.name)].join(' / ')}</dd>
							</dl>
							{#if place !== 'trash'}
								<Button variant="secondary" size="sm" onclick={() => star(one)}>
									<Icon icon={StarIcon} size={14} />
									{one.starred ? 'Unstar' : 'Star'}
								</Button>
							{/if}
						{:else if selection.length}
							<h3>{itemCount(selection.length)} selected</h3>
							<p>{bytes(selection.reduce((s, i) => s + (i.size ?? 0), 0))} in files.</p>
						{:else}
							<p class="hint">Choose a file or folder to see its details.</p>
						{/if}
					</aside>
				{/if}
			</div>

			{#if selection.length > 1}
				<div
					class="bar"
					role="toolbar"
					aria-label="Selection"
					transition:fly={{ y: 16, duration: ms(200) }}
				>
					<span class="count">{number.format(selection.length)} selected</span>
					{#if place === 'trash'}
						<Button size="sm" variant="ghost" onclick={() => restore(selection)}>Restore</Button>
						<Button size="sm" variant="ghost" onclick={() => askDelete(selection)}
							>Delete forever</Button
						>
					{:else}
						<Dropdown.Root>
							{#snippet trigger(props)}
								<Button size="sm" variant="ghost" {...props}>Move to</Button>
							{/snippet}
							{#each destinations(selection) as f (f.id ?? 'root')}
								<Dropdown.Item onselect={() => moveTo(selection, f.id)}>{f.name}</Dropdown.Item>
							{/each}
						</Dropdown.Root>
						<Button size="sm" variant="ghost" onclick={() => trash(selection)}>Move to Trash</Button
						>
					{/if}
					<Button
						size="sm"
						variant="ghost"
						square
						aria-label="Clear selection"
						onclick={() => picked.clear()}
					>
						<Icon icon={Cancel01Icon} size={16} />
					</Button>
				</div>
			{/if}
		</div>
	</SidebarLayout>
</div>

{#if uploads}<UploadTray {uploads} {locale} />{/if}

<Dialog bind:open={nameOpen} title={naming ? 'Rename' : 'New folder'}>
	<form id="{uid}-name" onsubmit={saveName}>
		<!-- svelte-ignore a11y_autofocus -->
		<Input label="Name" bind:value={draft} autofocus autocomplete="off" />
	</form>
	{#snippet footer()}
		<Button variant="secondary" onclick={() => (nameOpen = false)}>Cancel</Button>
		<Button type="submit" form="{uid}-name">{naming ? 'Save' : 'Create'}</Button>
	{/snippet}
</Dialog>

<AlertDialog
	bind:open={doomOpen}
	title="Delete {named(doomed)} forever?"
	description={doomed.some((i) => i.folder)
		? 'Folders go with everything in them. This can’t be undone.'
		: 'This can’t be undone.'}
	confirmLabel="Delete forever"
	onconfirm={destroy}
/>

<style>
	.explorer {
		inline-size: 100%;
		block-size: 42rem;
		max-block-size: 90dvh;
		overflow: hidden;
		border-radius: 1.25rem;
		background: var(--ui-bg);
		box-shadow: var(--ui-shadow-card);
	}
	.brand {
		font-weight: 600;
	}
	.vh {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.tree {
		display: grid;
		gap: 0.25rem;
		padding-block-end: 0.5rem;
	}
	.caption {
		margin: 0;
		padding-inline: 0.5rem;
		color: var(--ui-muted);
		font-size: 0.75rem;
		font-weight: 600;
	}
	.explorer :global(.collapsed .tree),
	.explorer :global(.collapsed .storage) {
		display: none;
	}
	.storage {
		padding: 0.25rem 0.5rem 0.5rem;
		font-size: 0.75rem;
	}
	.page {
		position: relative;
		display: grid;
		grid-template-rows: auto 1fr auto;
		gap: 0.75rem;
		min-block-size: 100%;
		padding: 1.25rem;
		box-sizing: border-box;
	}
	/* Files dragged in from the computer: the whole explorer says where they'll go. */
	.dropping::after {
		content: 'Drop to upload here';
		position: absolute;
		inset: 0.75rem;
		display: grid;
		place-items: center;
		border-radius: 1rem;
		background: color-mix(in srgb, var(--ui-accent) 10%, transparent);
		box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--ui-accent) 50%, transparent);
		color: var(--ui-accent);
		font-weight: 600;
		pointer-events: none;
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.where h2 {
		margin: 0;
		font-size: 1.125rem;
	}
	.tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.tools :global(.find label) {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.tick {
		display: grid;
		inline-size: 1rem;
	}
	.split {
		display: flex;
		align-items: start;
		gap: 1rem;
	}
	.body {
		display: grid;
		flex: 1;
		align-content: start;
		gap: 0.75rem;
		min-inline-size: 0;
	}
	.sentinel {
		block-size: 1px;
	}
	.section {
		margin: 0.5rem 0 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-weight: 600;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.folders {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
		gap: 0.25rem;
	}
	.folders :global(.folder) {
		inline-size: 100%;
	}
	.files {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		gap: 0.75rem;
	}
	.rows {
		display: grid;
		gap: 0.125rem;
	}
	li {
		position: relative;
		transition: opacity var(--ui-dur) ease;
	}
	/* Cut with ⌘X: dimmed until it's pasted somewhere. */
	li.cut {
		opacity: 0.5;
	}
	/* Each item's menu and checkbox show on hover or focus; always on touch screens. */
	li :global(.more),
	.check {
		position: absolute;
		inset-block-start: 0.375rem;
		opacity: 0;
		transition: opacity var(--ui-dur) ease;
	}
	li :global(.more) {
		inset-inline-end: 0.375rem;
	}
	li:hover :global(.more),
	li:focus-within :global(.more),
	li :global(.more[aria-expanded='true']),
	li:hover .check,
	.picking .check,
	.check[aria-pressed='true'] {
		opacity: 1;
	}
	@media (hover: none) {
		li :global(.more) {
			opacity: 1;
		}
	}
	.check {
		inset-inline-start: 0.5rem;
		display: grid;
		place-items: center;
		inline-size: 1.25rem;
		block-size: 1.25rem;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: var(--ui-surface);
		box-shadow: inset 0 0 0 1.5px var(--ui-control-line);
		color: transparent;
		cursor: pointer;
	}
	/* A bigger target than it looks, for fingers. */
	.check::before {
		content: '';
		position: absolute;
		inset: -0.625rem;
	}
	.check[aria-pressed='true'] {
		background: var(--ui-accent);
		box-shadow: none;
		color: var(--ui-on-accent);
	}
	.rows .check {
		inset-block-start: 50%;
		translate: 0 -50%;
	}
	.card,
	.row {
		inline-size: 100%;
		border: 0;
		color: var(--ui-fg);
		font: 0.875rem/1.3 var(--ui-font);
		text-align: start;
		cursor: pointer;
		transition:
			box-shadow var(--ui-dur) ease,
			background-color var(--ui-dur) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	.card:active,
	.row:active {
		transform: scale(0.98);
	}
	.card:focus-visible,
	.row:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.card {
		display: grid;
		gap: 0.125rem;
		padding: 0.5rem 0.5rem 0.75rem;
		border-radius: 1rem;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-card);
	}
	.card.selected {
		box-shadow:
			0 0 0 2px var(--ui-accent),
			var(--ui-shadow-card);
	}
	/* Concentric with the card: its radius less the padding. */
	.preview {
		display: grid;
		place-items: center;
		aspect-ratio: 4 / 3;
		margin-block-end: 0.5rem;
		overflow: hidden;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--k) 12%, transparent);
		color: var(--k);
	}
	.preview img,
	.thumb img,
	.big img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
	.card .name,
	.card .meta {
		padding-inline: 0.25rem;
	}
	.cols,
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 6rem 6rem;
		align-items: center;
		column-gap: 0.75rem;
		padding: 0.375rem 2.75rem 0.375rem 2.25rem;
	}
	.row {
		grid-template-columns: auto minmax(0, 1fr) 6rem 6rem;
		border-radius: var(--ui-radius);
		background: none;
	}
	.row:hover,
	.row.over {
		background: var(--ui-subtle);
	}
	.row.selected {
		background: color-mix(in srgb, var(--ui-accent) 12%, transparent);
	}
	.cols {
		padding-block: 0;
		padding-inline-start: 5rem;
	}
	.col {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		inline-size: fit-content;
		padding: 0.25rem 0;
		border: 0;
		background: none;
		color: var(--ui-muted);
		font: 600 0.75rem var(--ui-font);
		cursor: pointer;
	}
	.col:hover {
		color: var(--ui-fg);
	}
	.col:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
		border-radius: 0.25rem;
	}
	.col-date,
	.col-size {
		color: var(--ui-muted);
		font-size: 0.8125rem;
		white-space: nowrap;
	}
	.thumb {
		display: grid;
		place-items: center;
		inline-size: 2rem;
		block-size: 2rem;
		overflow: hidden;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--k) 12%, transparent);
		color: var(--k);
	}
	.name {
		overflow: hidden;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.meta {
		overflow: hidden;
		color: var(--ui-muted);
		font-size: 0.75rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.star {
		position: absolute;
		inset-block-end: 0.75rem;
		inset-inline-end: 0.75rem;
		color: var(--ui-warning);
	}
	.details {
		position: sticky;
		inset-block-start: 0;
		display: grid;
		flex: none;
		gap: 0.75rem;
		inline-size: 15rem;
		padding: 1rem;
		box-sizing: border-box;
		border-radius: 1rem;
		background: var(--ui-subtle);
		font-size: 0.875rem;
	}
	.details h3 {
		margin: 0;
		font-size: 0.9375rem;
		overflow-wrap: anywhere;
	}
	.details p {
		margin: 0;
		color: var(--ui-muted);
	}
	.big {
		display: grid;
		place-items: center;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--k) 12%, transparent);
		color: var(--k);
	}
	dl {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 0.375rem 0.75rem;
		margin: 0;
	}
	dt {
		color: var(--ui-muted);
	}
	dd {
		margin: 0;
		overflow-wrap: anywhere;
	}
	.details :global(.btn) {
		justify-self: start;
	}
	/* Several chosen: their actions float at the foot of the view. */
	.bar {
		position: sticky;
		inset-block-end: 0.5rem;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		justify-self: center;
		padding: 0.25rem 0.25rem 0.25rem 1rem;
		border-radius: 999px;
		background: var(--ui-surface);
		box-shadow: var(--ui-shadow-overlay);
	}
	.count {
		margin-inline-end: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.bar :global(.btn) {
		border-radius: 999px;
	}
	/* Narrow: the details slide over the files rather than squeezing them. */
	@container (max-width: 40rem) {
		.details {
			position: absolute;
			inset-inline-end: 1.25rem;
			z-index: 2;
			box-shadow: var(--ui-shadow-overlay);
		}
		.col.modified,
		.col-date {
			display: none;
		}
		.cols,
		.row {
			grid-template-columns: minmax(0, 1fr) 6rem;
		}
		.row {
			grid-template-columns: auto minmax(0, 1fr) 6rem;
		}
	}
</style>
