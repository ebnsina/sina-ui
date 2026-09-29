<script lang="ts">
	import AlarmClock, { type Alarm } from '#lib/ui/AlarmClock.svelte';

	let alarms = $state<Alarm[]>([
		{ id: 'fajr', time: '05:15', label: 'Fajr', on: true },
		{ id: 'lecture', time: '09:00', label: 'Lecture at the Nizamiyya', on: false }
	]);
</script>

<AlarmClock bind:alarms persist="sinaui-alarms" />
