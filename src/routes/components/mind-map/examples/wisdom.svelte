<script lang="ts">
	import MindMap from '#lib/ui/MindMap.svelte';
	import type { MindNode } from '#lib/ui/mindmap.js';
	import {
		BookOpen01Icon,
		MedicineBottle01Icon,
		SunCloud01Icon,
		CalculatorIcon
	} from '@hugeicons/core-free-icons';

	let root: MindNode = $state({
		id: 'wisdom',
		label: 'The House of Wisdom',
		note: 'Baghdad, 9th century',
		children: [
			{
				id: 'translation',
				label: 'Translation',
				icon: BookOpen01Icon,
				children: [
					{
						id: 'greek',
						label: 'Greek',
						children: [
							{ id: 'aristotle', label: 'Aristotle' },
							{ id: 'galen', label: 'Galen' }
						]
					},
					{ id: 'persian', label: 'Persian' },
					{ id: 'sanskrit', label: 'Sanskrit', note: 'Siddhanta tables' }
				]
			},
			{
				id: 'astronomy',
				label: 'Astronomy',
				icon: SunCloud01Icon,
				collapsed: true,
				children: [
					{ id: 'observatory', label: 'Shammasiyya observatory' },
					{ id: 'zij', label: 'Star tables (zij)' },
					{ id: 'earth', label: 'Measuring the Earth' }
				]
			},
			{
				id: 'medicine',
				label: 'Medicine',
				icon: MedicineBottle01Icon,
				children: [
					{ id: 'hunayn', label: 'Hunayn ibn Ishaq', note: 'Ten treatises on the eye' },
					{ id: 'hospitals', label: 'Hospitals (bimaristan)' }
				]
			},
			{
				id: 'mathematics',
				label: 'Mathematics',
				icon: CalculatorIcon,
				children: [
					{
						id: 'algebra',
						label: 'Al-Khwarizmi’s algebra',
						children: [
							{ id: 'jabr', label: 'Completion (al-jabr)' },
							{ id: 'muqabala', label: 'Balancing' }
						]
					},
					{ id: 'numerals', label: 'Hindu numerals' }
				]
			}
		]
	});
</script>

<div class="frame">
	<MindMap bind:root label="The House of Wisdom" />
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 30rem;
	}
</style>
