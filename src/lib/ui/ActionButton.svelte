<script lang="ts">
	import { AlertCircleIcon, Tick02Icon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import { announce } from './announce';
	import Button from './Button.svelte';
	import Morph from './Morph.svelte';

	interface Props {
		/** What the press does. A promise keeps the button busy until it settles. */
		action: () => Promise<unknown> | unknown;
		children: Snippet;
		/** Text beside the spinner while working, e.g. "Saving…". */
		pending?: string;
		done?: string;
		failed?: string;
		onerror?: (error: unknown) => void;
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		action,
		children,
		pending,
		done = 'Done',
		failed = 'Didn’t work',
		onerror,
		variant = 'primary',
		size,
		class: className
	}: Props = $props();

	let status = $state<'idle' | 'working' | 'done' | 'failed'>('idle');
	let timer: ReturnType<typeof setTimeout>;
	$effect(() => () => clearTimeout(timer));

	async function run() {
		if (status !== 'idle') return;
		status = 'working';
		if (pending) announce(pending);
		try {
			await action();
			status = 'done';
			announce(done);
		} catch (e) {
			status = 'failed';
			announce(failed, 'assertive');
			onerror?.(e);
		}
		timer = setTimeout(() => (status = 'idle'), status === 'done' ? 1600 : 2400);
	}
</script>

<!-- Presses while busy or showing the result are ignored (see run); it stays full color. -->
<Button
	variant={status === 'failed' ? 'danger' : variant}
	{size}
	class={className}
	aria-busy={status === 'working' || undefined}
	onclick={run}
>
	<Morph
		current={status}
		states={[
			{ key: 'idle', label: children },
			{ key: 'working', text: pending, spinner: true },
			{ key: 'done', text: done, icon: Tick02Icon },
			{ key: 'failed', text: failed, icon: AlertCircleIcon }
		]}
	/>
</Button>
