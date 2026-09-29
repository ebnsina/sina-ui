<script lang="ts">
	import * as Resizable from '#lib/ui/resizable/index.js';
</script>

<div class="frame">
	<Resizable.Group orientation="vertical">
		<Resizable.Panel minSize={25} label="Text">
			<div class="pane">
				<p>
					The Compendious Book on Calculation by Completion and Balancing, written by al-Khwarizmi
					in Baghdad around 820, gave algebra its name.
				</p>
			</div>
		</Resizable.Panel>
		<Resizable.Handle label="Resize the text" />
		<Resizable.Panel minSize={25} label="Commentary">
			<div class="pane">
				<p>“Completion” is al-jabr: moving a subtracted term to the other side of the equation.</p>
			</div>
		</Resizable.Panel>
	</Resizable.Group>
</div>

<style>
	.frame {
		inline-size: 100%;
		block-size: 14rem;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
		overflow: hidden;
	}
	.pane {
		padding: 1rem;
		font-size: 0.9375rem;
		line-height: 1.7;
	}
	p {
		margin: 0;
	}
</style>
