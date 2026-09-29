<script lang="ts">
	import * as Tabs from '#lib/ui/tabs/index.js';

	let scholar = $state('ibn-sina');
</script>

<Tabs.Root bind:value={scholar}>
	<Tabs.List label="Scholars">
		<Tabs.Tab value="ibn-sina">Ibn Sina</Tabs.Tab>
		<Tabs.Tab value="khwarizmi">Al-Khwarizmi</Tabs.Tab>
		<Tabs.Tab value="biruni" disabled>Al-Biruni</Tabs.Tab>
		<Tabs.Tab value="fihri">Fatima al-Fihri</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value="ibn-sina">
		The Canon of Medicine, taught in Europe's medical schools for centuries.
	</Tabs.Panel>
	<Tabs.Panel value="khwarizmi">
		Al-Jabr gave algebra its name, solving problems like <code>x² + 10x = 39</code>.
	</Tabs.Panel>
	<Tabs.Panel value="biruni">Measured the radius of the Earth from a mountaintop.</Tabs.Panel>
	<Tabs.Panel value="fihri">Founded al-Qarawiyyin in Fez in 859, still teaching today.</Tabs.Panel>
</Tabs.Root>
