<script lang="ts">
	import CodeBlock from '#lib/ui/CodeBlock.svelte';

	const code = `// The angle of a star above the horizon, from its hour angle and declination.
export function altitude(latitude: number, declination: number, hourAngle: number) {
	const rad = Math.PI / 180;
	const sin =
		Math.sin(latitude * rad) * Math.sin(declination * rad) +
		Math.cos(latitude * rad) * Math.cos(declination * rad) * Math.cos(hourAngle * rad);
	return Math.asin(sin) / rad;
}

// Maragheh observatory, Vega at its meridian.
altitude(37.39, 38.78, 0);`;
</script>

<CodeBlock {code} lang="ts" filename="src/lib/astrolabe.ts" highlight="4-6" class="demo" />

<style>
	:global(.demo) {
		inline-size: min(40rem, 100%);
	}
</style>
