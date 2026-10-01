<script lang="ts">
	import Meeting from '#lib/blocks/booking/Meeting.svelte';
</script>

<Meeting
	title="Reading-room tour"
	host={{ name: 'Hunayn ibn Ishaq', role: 'Keeper of the translations' }}
	hours={{ timeZone: 'Asia/Baghdad', open: 9, close: 17, days: [0, 1, 2, 3, 4] }}
	location="Bayt al-Hikma, west reading room"
/>
