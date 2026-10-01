<script lang="ts">
	import InlineEdit from '#lib/ui/InlineEdit.svelte';

	let name = $state('Maryam al-Asturlabi');
	let email = $state('maryam@bayt-al-hikma.org');
	let city = $state('Aleppo');
	let note = $state('');
	let tries = 0;

	// Stand-ins for your API. The city save fails the first time, to show what happens.
	const wait = () => new Promise((r) => setTimeout(r, 600));
	const saveCity = async () => {
		await wait();
		if (tries++ === 0) throw new Error('offline');
	};
</script>

<dl class="profile">
	<div>
		<dt class="sr">Name</dt>
		<dd><InlineEdit label="Name" bind:value={name} required onsave={wait} /></dd>
	</div>
	<div>
		<dt class="sr">Email</dt>
		<dd>
			<InlineEdit
				label="Email"
				type="email"
				bind:value={email}
				required
				validate={(v) =>
					/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
						? undefined
						: 'Enter an email like name@example.com.'}
				onsave={wait}
			/>
		</dd>
	</div>
	<div>
		<dt class="sr">City</dt>
		<dd><InlineEdit label="City" bind:value={city} onsave={saveCity} /></dd>
	</div>
	<div>
		<dt class="sr">Note</dt>
		<dd><InlineEdit label="Note" bind:value={note} placeholder="Add a note" onsave={wait} /></dd>
	</div>
</dl>

<style>
	.profile {
		display: grid;
		gap: 0.75rem;
		inline-size: min(24rem, 100%);
		margin: 0;
	}
	dd {
		margin: 0;
	}
	.sr {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
