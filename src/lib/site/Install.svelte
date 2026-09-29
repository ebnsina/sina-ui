<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Tabs from '#lib/ui/tabs/index.js';
	import Code from './Code.svelte';

	/** Registry names, space-separated: "sortable", "upload-list upload-tray", "blocks/chat". */
	let { names, children }: { names: string; children?: Snippet } = $props();
</script>

<Tabs.Root class="install">
	<Tabs.List label="How to install">
		<Tabs.Tab value="cli">CLI</Tabs.Tab>
		<Tabs.Tab value="manual">Manual</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value="cli">
		<Code code="npx sina-ui add {names}" lang="shell" label="Add command" />
	</Tabs.Panel>
	<Tabs.Panel value="manual">
		{#if children}
			{@render children()}
		{:else}
			<p>
				Copy the files listed in
				{#each names.split(' ') as n, i (n)}{#if i},
					{/if}<a href="/r/{n}.json">its registry entry</a>{/each}, and install the packages it
				names.
			</p>
		{/if}
	</Tabs.Panel>
</Tabs.Root>

<style>
	:global(.install) {
		margin-block: 0.75rem 1.5rem;
	}
	:global(.install [role='tabpanel']) {
		padding-block-start: 0.75rem;
	}
	:global(.install [role='tabpanel'] > p:first-child) {
		margin-block-start: 0;
	}
</style>
