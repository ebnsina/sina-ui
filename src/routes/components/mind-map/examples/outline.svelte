<script lang="ts">
	import MindMap from '#lib/ui/MindMap.svelte';
	import type { MindNode } from '#lib/ui/mindmap.js';

	let root: MindNode = $state({
		id: 'optics',
		label: 'Book of Optics',
		note: 'Ibn al-Haytham',
		children: [
			{
				id: 'b1',
				label: 'Book I: How we see',
				children: [
					{ id: 'b1-rays', label: 'Light enters the eye' },
					{ id: 'b1-eye', label: 'Parts of the eye' }
				]
			},
			{
				id: 'b2',
				label: 'Book II: What we see',
				children: [{ id: 'b2-form', label: 'Recognizing form' }]
			},
			{ id: 'b3', label: 'Book III: Errors of sight' },
			{
				id: 'b4',
				label: 'Books IV–VII: Reflection and refraction',
				children: [
					{ id: 'mirrors', label: 'Mirrors' },
					{ id: 'alhazen', label: 'Alhazen’s problem' },
					{ id: 'refraction', label: 'Refraction' }
				]
			}
		]
	});
</script>

<div class="frame">
	<MindMap bind:root label="Outline of the Book of Optics" sides="right" />
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 28rem;
	}
</style>
