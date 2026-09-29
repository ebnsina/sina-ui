<script lang="ts">
	import * as Tabs from '#lib/ui/tabs/index.js';
</script>

<!-- No value: the first enabled tab is selected, already in the server-rendered HTML. -->
<Tabs.Root orientation="vertical" activation="manual">
	<Tabs.List label="Ibn al-Haytham's Book of Optics">
		<Tabs.Tab value="light">Light</Tabs.Tab>
		<Tabs.Tab value="vision">Vision</Tabs.Tab>
		<Tabs.Tab value="camera">Camera obscura</Tabs.Tab>
	</Tabs.List>
	<Tabs.Panel value="light">
		Light travels in straight lines, shown by experiment rather than argument alone.
	</Tabs.Panel>
	<Tabs.Panel value="vision">
		We see because light enters the eye, not because the eye sends out rays.
	</Tabs.Panel>
	<Tabs.Panel value="camera">
		A dark room with a small hole projects an inverted image of the world outside.
	</Tabs.Panel>
</Tabs.Root>
