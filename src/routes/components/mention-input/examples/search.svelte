<script lang="ts">
	import MentionInput, { type Person } from '#lib/ui/MentionInput.svelte';

	// Stands in for your API: a short wait, then the matches.
	const staff: Person[] = [
		{ id: 'hunayn', name: 'Hunayn ibn Ishaq', detail: 'Head translator' },
		{ id: 'thabit', name: 'Thabit ibn Qurra', detail: 'Mathematics' },
		{ id: 'banu-musa', name: 'Banu Musa', detail: 'Instruments' },
		{ id: 'kindi', name: 'Al-Kindi', detail: 'Philosophy' }
	];
	async function search(q: string) {
		await new Promise((r) => setTimeout(r, 300));
		const f = q.toLowerCase();
		return staff.filter((p) => p.name.toLowerCase().includes(f));
	}
</script>

<div class="demo">
	<MentionInput label="Reply" {search} rows={2} placeholder="@ to mention the translators" />
</div>

<style>
	.demo {
		inline-size: min(28rem, 100%);
	}
</style>
