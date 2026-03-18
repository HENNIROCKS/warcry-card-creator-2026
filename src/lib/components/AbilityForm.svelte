<script lang="ts">
	import type { AbilityCardData } from '$lib/types';
	import { fighterRunemarks } from '$lib/runemarks/index';
	import FactionSelect from './FactionSelect.svelte';

	let { data }: { data: AbilityCardData } = $props();

	let rmKeys = $state(['', '']);

	$effect(() => {
		data.fighterRunemarks = rmKeys
			.filter(k => k !== '')
			.sort((a, b) => (a === 'Hero' || a === 'Monster' ? -1 : 0) - (b === 'Hero' || b === 'Monster' ? -1 : 0))
			.map(k => ({ id: k, label: k, svg: fighterRunemarks[k] }));
	});
</script>

<div class="space-y-10 text-sm">

	<!-- Card Type -->
	<section>
		<label class="field-label" for="card-label">Card Type</label>
		<select id="card-label" class="field-input" bind:value={data.cardLabel}>
			<option value="ABILITY">Ability</option>
			<option value="REACTION">Reaction</option>
			<option value="HEROIC TRAIT">Heroic Trait</option>
			<option value="LESSER ARTEFACT">Lesser Artefact</option>
			<option value="GREATER ARTEFACT">Greater Artefact</option>
		</select>
	</section>

	<!-- Card Name -->
	<section>
		<label class="field-label" for="ability-name">Card Name <span class="normal-case font-normal text-zinc-500">— use | for a line break</span></label>
		<input
			id="ability-name"
			class="field-input"
			type="text"
			bind:value={data.name}
		/>
	</section>

	<!-- Show Runemarks -->
	<section>
		<label class="flex cursor-pointer items-center gap-3">
			<input type="checkbox" bind:checked={data.showRunemarks} class="h-4 w-4 rounded accent-red-800" />
			<span class="text-zinc-200">Show Runemarks</span>
		</label>
	</section>

	<!-- Runemarks -->
	<section>
		<p class="field-label mb-2">Runemarks</p>
		<FactionSelect {data} />
		<div class="mt-3">
			<p class="sublabel mb-1">Fighter Runemarks</p>
			<div class="flex flex-col gap-2">
				{#each [0, 1] as i}
					<select class="field-input" bind:value={rmKeys[i]}>
						<option value="">—</option>
						{#each Object.keys(fighterRunemarks) as name}
							<option value={name} disabled={
								(rmKeys[i] !== name && rmKeys.some((k, j) => j !== i && k === name)) ||
								(name === 'Monster' && rmKeys.some(k => k === 'Hero')) ||
								(name === 'Hero' && rmKeys.some(k => k === 'Monster'))
							}>{name}</option>
						{/each}
					</select>
				{/each}
			</div>
		</div>
	</section>

	<!-- Activation -->
	<section>
		<label class="field-label" for="activation">Activation</label>
		<select id="activation" class="field-input" bind:value={data.activationType}>
			<option value={null}>—</option>
			<option value="double">Double</option>
			<option value="triple">Triple</option>
			<option value="quad">Quad</option>
		</select>
	</section>


	<!-- Flavor Text -->
	<section>
		<label class="field-label" for="flavor-text">Flavor Text <span class="normal-case font-normal text-zinc-500">(italic, optional)</span></label>
		<textarea
			id="flavor-text"
			class="field-input resize-none"
			rows="3"
			bind:value={data.flavorText}
		></textarea>
	</section>

	<!-- Body Text -->
	<section>
		<label class="field-label" for="body-text">Body Text</label>
		<textarea
			id="body-text"
			class="field-input resize-none"
			rows="8"
			bind:value={data.bodyText}
		></textarea>
	</section>

</div>

<style>
	.field-label {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ui-field-label);
		margin-bottom: 0.375rem;
	}

	.sublabel {
		display: block;
		font-size: 0.65rem;
		color: var(--ui-field-label);
		margin-bottom: 2px;
	}

	.field-input {
		width: 100%;
		box-sizing: border-box;
		appearance: none;
		background: var(--ui-surface);
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		padding: 6px 10px;
		color: var(--ui-text);
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.field-input:focus {
		border-color: #7f1d1d;
	}

	@media (max-width: 1023px) {
		.field-input {
			font-size: 1rem;
		}
	}
</style>
