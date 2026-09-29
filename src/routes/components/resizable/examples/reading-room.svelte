<script lang="ts">
	import * as Resizable from '#lib/ui/resizable/index.js';
</script>

<div class="frame">
	<Resizable.Group persist="sinaui-reading-room">
		<Resizable.Panel defaultSize={24} minSize={16} collapsible label="Catalogue">
			<div class="pane">
				<h4>Catalogue</h4>
				<ul>
					<li>Book of Optics</li>
					<li>The Canon of Medicine</li>
					<li>Al-Jabr</li>
					<li>Tabula Rogeriana</li>
				</ul>
			</div>
		</Resizable.Panel>
		<Resizable.Handle label="Resize the catalogue" />
		<Resizable.Panel minSize={30} label="Manuscript">
			<div class="pane">
				<h4>Book of Optics</h4>
				<p>
					Ibn al-Haytham argued that we see because light travels from objects into the eye, and
					tested it by experiment: light in a dark room, through a small hole.
				</p>
			</div>
		</Resizable.Panel>
		<Resizable.Handle label="Resize the notes" />
		<Resizable.Panel defaultSize={26} minSize={18} label="Notes">
			<div class="pane">
				<h4>Notes</h4>
				<p>Compare with the Latin translation, <i>De aspectibus</i>.</p>
			</div>
		</Resizable.Panel>
	</Resizable.Group>
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 16rem;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
		overflow: hidden;
	}
	.pane {
		padding: 1rem;
		font-size: 0.875rem;
		line-height: 1.55;
	}
	h4 {
		margin: 0 0 0.5rem;
		font-size: 0.9375rem;
	}
	p,
	ul {
		margin: 0;
		color: var(--ui-muted);
	}
	ul {
		display: grid;
		gap: 0.375rem;
		padding-inline-start: 1.1rem;
	}
</style>
