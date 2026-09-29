<script lang="ts" module>
	import {
		columnFilteringFeature,
		createFilteredRowModel,
		createPaginatedRowModel,
		createSortedRowModel,
		filterFns,
		globalFilteringFeature,
		rowPaginationFeature,
		rowSortingFeature,
		sortFns,
		tableFeatures,
		type ColumnDef,
		type RowData
	} from '@tanstack/svelte-table';

	export const features = tableFeatures({
		rowSortingFeature,
		sortedRowModel: createSortedRowModel(),
		sortFns,
		columnFilteringFeature,
		globalFilteringFeature,
		filteredRowModel: createFilteredRowModel(),
		filterFns,
		rowPaginationFeature,
		paginatedRowModel: createPaginatedRowModel()
	});

	/** A column for DataTable. `meta: { align: 'end' }` right-aligns numbers (left in RTL). */
	export type Column<T extends RowData> = ColumnDef<typeof features, T>;
</script>

<script lang="ts" generics="T extends RowData">
	import { ArrowLeft01Icon, ArrowRight01Icon, ArrowUp02Icon } from '@hugeicons/core-free-icons';
	import { createTable, FlexRender } from '@tanstack/svelte-table';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Input from './Input.svelte';
	import RollingNumber from './RollingNumber.svelte';
	import { scrollEdges } from './scroll-edges';

	interface Props {
		/** Names the table for everyone; hide it visually with hideCaption. */
		caption: string;
		hideCaption?: boolean;
		data: T[];
		columns: Column<T>[];
		/** Label for a search box over every column; no box without it. */
		searchLabel?: string;
		/** Rows per page; pages controls show only when there's more than one page. */
		pageSize?: number;
		/** Shown when a search matches nothing. */
		empty?: string;
	}

	let {
		caption,
		hideCaption = false,
		data,
		columns,
		searchLabel,
		pageSize = 10,
		empty = 'No matching rows'
	}: Props = $props();

	const id = $props.id();
	// Accent- and case-insensitive, as in Combobox: "sina" finds Ibn Sīnā.
	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

	const table = createTable({
		features,
		get columns() {
			return columns;
		},
		get data() {
			return data;
		},
		globalFilterFn: (row, columnId, q: string) =>
			fold(String(row.getValue(columnId) ?? '')).includes(fold(q.trim())),
		initialState: {
			// svelte-ignore state_referenced_locally
			pagination: { pageIndex: 0, pageSize }
		}
	});

	const nf = new Intl.NumberFormat();
	const rows = $derived(table.getRowModel().rows);
	const total = $derived(table.getFilteredRowModel().rows.length);
	const page = $derived(table.atoms.pagination.get());
	const sorting = $derived(table.atoms.sorting.get()[0]);
	const query = $derived(table.atoms.globalFilter.get() ?? '');
	const alignOf = (meta: unknown) => (meta as { align?: 'end' } | undefined)?.align;
	const headerText = (colId: string) => {
		const h = table.getColumn(colId)?.columnDef.header;
		return typeof h === 'string' ? h : colId;
	};

	// One sentence that changes when sorting or searching does, so screen readers hear the outcome.
	const status = $derived(
		[
			query && `${nf.format(total)} ${total === 1 ? 'row' : 'rows'}`,
			sorting && `sorted by ${headerText(sorting.id)}, ${sorting.desc ? 'descending' : 'ascending'}`
		]
			.filter(Boolean)
			.join(', ')
	);
</script>

<div class="data-table">
	{#if searchLabel}
		<Input
			class="search"
			type="search"
			label={searchLabel}
			value={query}
			oninput={(e) => table.setGlobalFilter(e.currentTarget.value)}
		/>
	{/if}

	<!-- Focusable so keyboard users can scroll a table wider than the screen. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="scroll"
		{@attach scrollEdges}
		data-fade="x"
		role="region"
		aria-labelledby="{id}-caption"
		tabindex="0"
	>
		<table>
			<caption id="{id}-caption" class:sr-only={hideCaption}>{caption}</caption>
			<thead>
				{#each table.getHeaderGroups() as group (group.id)}
					<tr>
						{#each group.headers as header (header.id)}
							{@const dir = header.column.getIsSorted()}
							<th
								scope="col"
								class={alignOf(header.column.columnDef.meta)}
								aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : undefined}
							>
								{#if header.isPlaceholder}{:else if header.column.getCanSort()}
									<button
										type="button"
										class="sort"
										onclick={header.column.getToggleSortingHandler()}
									>
										<FlexRender {header} />
										<span class={['arrow', dir]} aria-hidden="true">
											<Icon icon={ArrowUp02Icon} size={14} />
										</span>
									</button>
								{:else}
									<FlexRender {header} />
								{/if}
							</th>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody>
				{#each rows as row (row.id)}
					<tr>
						{#each row.getAllCells() as cell (cell.id)}
							<td class={alignOf(cell.column.columnDef.meta)}><FlexRender {cell} /></td>
						{/each}
					</tr>
				{:else}
					<tr><td class="empty" colspan={table.getAllLeafColumns().length}>{empty}</td></tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if table.getPageCount() > 1}
		{@const from = page.pageIndex * page.pageSize}
		<div class="pages">
			<p>
				<RollingNumber value={from + 1} />–<RollingNumber
					value={Math.min(from + page.pageSize, total)}
				/>
				of <RollingNumber value={total} />
			</p>
			<div class="page-buttons">
				<Button
					variant="ghost"
					size="sm"
					square
					aria-label="Previous page"
					aria-disabled={!table.getCanPreviousPage() || undefined}
					onclick={() => table.getCanPreviousPage() && table.previousPage()}
				>
					<Icon icon={ArrowLeft01Icon} size={16} class="flip" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					square
					aria-label="Next page"
					aria-disabled={!table.getCanNextPage() || undefined}
					onclick={() => table.getCanNextPage() && table.nextPage()}
				>
					<Icon icon={ArrowRight01Icon} size={16} class="flip" />
				</Button>
			</div>
		</div>
	{/if}
	<p role="status" class="sr-only">{status}</p>
</div>

<style>
	/* Fills its container even inside a flex row, which would otherwise shrink it to its content. */
	.data-table {
		display: grid;
		box-sizing: border-box;
		inline-size: 100%;
		gap: 0.75rem;
		min-inline-size: 0;
		color: var(--ui-fg);
		font: 0.9375rem/1.5 var(--ui-font);
	}
	.data-table :global(.search) {
		max-inline-size: 20rem;
	}
	.scroll {
		overflow-x: auto;
		border-radius: var(--ui-radius);
	}
	.scroll:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	table {
		inline-size: 100%;
		border-collapse: separate;
		border-spacing: 0;
	}
	caption {
		padding-block-end: 0.5rem;
		font-weight: 600;
		text-align: start;
	}
	th,
	td {
		padding: 0.5rem 0.75rem;
		text-align: start;
		white-space: nowrap;
	}
	th {
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-weight: 500;
	}
	.end {
		text-align: end;
		font-variant-numeric: tabular-nums;
	}
	/* Rows told apart by tint, not rules. */
	tbody tr:nth-child(odd) td {
		background: var(--ui-subtle);
	}
	td:first-child {
		border-start-start-radius: calc(var(--ui-radius) - 0.125rem);
		border-end-start-radius: calc(var(--ui-radius) - 0.125rem);
	}
	td:last-child {
		border-start-end-radius: calc(var(--ui-radius) - 0.125rem);
		border-end-end-radius: calc(var(--ui-radius) - 0.125rem);
	}
	td.empty {
		padding-block: 2rem;
		background: none;
		color: var(--ui-muted);
		text-align: center;
	}

	.sort {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		margin: -0.25rem -0.375rem;
		padding: 0.25rem 0.375rem;
		border: 0;
		border-radius: calc(var(--ui-radius) - 0.25rem);
		background: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.end .sort {
		flex-direction: row-reverse;
	}
	.sort:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 0;
	}
	@media (hover: hover) and (pointer: fine) {
		.sort:hover {
			color: var(--ui-fg);
		}
	}
	/* Faint until hovered or sorted; flips (transform only) between ascending and descending. */
	.arrow {
		display: grid;
		opacity: 0;
		transition:
			opacity var(--ui-dur) ease,
			transform var(--ui-dur) var(--ui-ease-out);
	}
	.sort:hover .arrow,
	.sort:focus-visible .arrow {
		opacity: 0.45;
	}
	.arrow.asc,
	.arrow.desc {
		opacity: 1;
		color: var(--ui-fg);
	}
	.arrow.desc {
		transform: rotate(180deg);
	}
	@media (prefers-reduced-motion: reduce) {
		.arrow {
			transition: opacity var(--ui-dur) ease;
		}
	}

	.pages {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}
	.pages p {
		margin: 0;
	}
	.page-buttons {
		display: flex;
		gap: 0.25rem;
	}
	/* Previous/next arrows point the reading direction. */
	.page-buttons :global(.flip:dir(rtl)) {
		transform: scaleX(-1);
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
