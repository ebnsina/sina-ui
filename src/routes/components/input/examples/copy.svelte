<script lang="ts">
	import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import Input from '#lib/ui/Input.svelte';
	import InputButton from '#lib/ui/InputButton.svelte';
	import { announce } from '#lib/ui/announce.js';

	const link = 'https://bayt-al-hikma.org/manuscripts/optics-1021';
	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(link);
		copied = true;
		announce('Link copied');
		setTimeout(() => (copied = false), 1600);
	}
</script>

<Input label="Share link" value={link} readonly onfocus={(e) => e.currentTarget.select()}>
	{#snippet end()}
		<InputButton icon={copied ? Tick02Icon : Copy01Icon} aria-label="Copy link" onclick={copy} />
	{/snippet}
</Input>
