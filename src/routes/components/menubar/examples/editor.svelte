<script lang="ts">
	import Kbd from '#lib/ui/Kbd.svelte';
	import * as Menubar from '#lib/ui/menubar/index.js';

	let last = $state('Nothing chosen yet.');
	const did = (what: string) => () => (last = what);
</script>

<div class="stack">
	<Menubar.Root label="Manuscript editor">
		<Menubar.Menu label="File">
			<Menubar.Item onselect={did('Started a new page.')}>
				New page <span class="keys"><Kbd keys={['mod', 'N']} /></span>
			</Menubar.Item>
			<Menubar.Item onselect={did('Opened the catalogue.')}>Open from the catalogue…</Menubar.Item>
			<Menubar.Item onselect={did('Saved the page.')}>
				Save <span class="keys"><Kbd keys={['mod', 'S']} /></span>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onselect={did('Sent to the copyists.')}>Send to the copyists</Menubar.Item>
		</Menubar.Menu>
		<Menubar.Menu label="Edit">
			<Menubar.Item onselect={did('Undid the last change.')}>
				Undo <span class="keys"><Kbd keys={['mod', 'Z']} /></span>
			</Menubar.Item>
			<Menubar.Item onselect={did('Redid the change.')}>
				Redo <span class="keys"><Kbd keys={['mod', 'shift', 'Z']} /></span>
			</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item onselect={did('Added a note in the margin.')}>Add a margin note</Menubar.Item>
			<Menubar.Item disabled>Remove the illumination</Menubar.Item>
		</Menubar.Menu>
		<Menubar.Menu label="View">
			<Menubar.Item onselect={did('Zoomed in.')}>
				Zoom in <span class="keys"><Kbd keys={['mod', '+']} /></span>
			</Menubar.Item>
			<Menubar.Item onselect={did('Zoomed out.')}>
				Zoom out <span class="keys"><Kbd keys={['mod', '-']} /></span>
			</Menubar.Item>
			<Menubar.Item onselect={did('Showing the facing page.')}>Show the facing page</Menubar.Item>
		</Menubar.Menu>
		<Menubar.Menu label="Help">
			<Menubar.Item onselect={did('Opened the keyboard guide.')}>Keyboard guide</Menubar.Item>
			<Menubar.Item href="/components/menubar#accessibility">About the menu bar</Menubar.Item>
		</Menubar.Menu>
	</Menubar.Root>
	<p role="status">{last}</p>
</div>

<style>
	.stack {
		display: grid;
		gap: 1rem;
	}
	.keys {
		margin-inline-start: auto;
		padding-inline-start: 1.5rem;
	}
	p {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
