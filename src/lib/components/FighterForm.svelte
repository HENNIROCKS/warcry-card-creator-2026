<script lang="ts">
	import type { FighterCardData } from '$lib/types';
	import { hierarchy, getFactions, getSubfactions, fighterRunemarks } from '$lib/runemarks/index';

	let { data }: { data: FighterCardData } = $props();

	let rmKeys = $state(['', '', '']);

	$effect(() => {
		const priority = (k: string) => k === 'Hero' || k === 'Monster' ? -1 : 0;
		data.rightRunemarks = rmKeys
			.filter(k => k !== '')
			.sort((a, b) => priority(a) - priority(b))
			.map(k => ({ id: k, label: k, svg: fighterRunemarks[k] }));
	});

	function handleImageUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			data.modelImage = ev.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

</script>

<div class="space-y-10 text-sm">
	<!-- Fighter Name -->
	<section>
		<label class="field-label" for="fighter-name">Fighter</label>
		<input
			id="fighter-name"
			class="field-input"
			type="text"
			bind:value={data.name}
			placeholder="FIGHTER"
		/>
	</section>

	<!-- Checkboxes -->
	<section class="flex flex-col gap-3">
		<label class="flex cursor-pointer items-center gap-3">
			<input type="checkbox" bind:checked={data.isNamedCharacter} class="h-4 w-4 rounded accent-red-800" />
			<span class="text-zinc-200">Named Fighter</span>
		</label>
		<label class="flex cursor-pointer items-center gap-3">
			<input type="checkbox" bind:checked={data.isMonster} class="h-4 w-4 rounded accent-red-800" />
			<span class="text-zinc-200">Monster (show damage bracket table)</span>
		</label>
		<label class="flex cursor-pointer items-center gap-3">
			<input type="checkbox" bind:checked={data.showRunemarks} class="h-4 w-4 rounded accent-red-800" />
			<span class="text-zinc-200">Show Runemarks</span>
		</label>
	</section>

	<!-- Model Image -->
	<section>
		<span class="field-label">Model Image</span>
		{#if data.modelImage}
			<div class="flex items-center gap-3 mb-3">
				<img src={data.modelImage} alt="Preview" class="h-16 w-16 rounded object-cover" />
				<button
					class="text-xs text-zinc-400 underline hover:text-white"
					onclick={() => (data.modelImage = null)}
				>
					Remove
				</button>
			</div>
			<div class="space-y-2">
				<div>
					<label class="sublabel" for="img-offset-x">Position X</label>
					<input id="img-offset-x" type="range" min="0" max="100" bind:value={data.imageOffsetX} class="w-full accent-red-800" />
				</div>
				<div>
					<label class="sublabel" for="img-offset-y">Position Y</label>
					<input id="img-offset-y" type="range" min="0" max="100" bind:value={data.imageOffsetY} class="w-full accent-red-800" />
				</div>
				<div>
					<label class="sublabel" for="img-zoom">Zoom</label>
					<input id="img-zoom" type="range" min="1" max="3" step="0.05" bind:value={data.imageZoom} class="w-full accent-red-800" />
				</div>
			</div>
		{:else}
			<label
				class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-6 transition hover:border-zinc-500"
			>
				<span class="text-zinc-300">Click to upload image</span>
				<span class="mt-1 text-xs text-zinc-400">PNG, JPG, WebP</span>
				<input type="file" accept="image/*" class="sr-only" onchange={handleImageUpload} />
			</label>
		{/if}
	</section>

	<!-- Runemarks -->
	<section>
		<p class="field-label mb-2">Runemarks</p>
		<div class="flex flex-col gap-2">
			<div>
				<label class="sublabel" for="grand-alliance">Grand Alliance</label>
				<select
					id="grand-alliance"
					class="field-input"
					bind:value={data.grandAlliance}
					onchange={() => { data.faction = ''; data.bladeborn = ''; }}
				>
					<option value="">—</option>
					{#each hierarchy as alliance}
						<option value={alliance.label}>{alliance.label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="sublabel" for="faction">Faction</label>
				<select
					id="faction"
					class="field-input"
					bind:value={data.faction}
					disabled={!data.grandAlliance}
					onchange={() => { data.bladeborn = ''; }}
				>
					<option value="">—</option>
					{#each getFactions(data.grandAlliance) as faction}
						<option value={faction.label}>{faction.label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="sublabel" for="bladeborn">Subfaction / Bladeborn</label>
				<select
					id="bladeborn"
					class="field-input"
					bind:value={data.bladeborn}
					disabled={!data.faction}
				>
					<option value="">—</option>
					{#each getSubfactions(data.grandAlliance, data.faction) as sf}
						<option value={sf.label}>{sf.label}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="mt-3">
			<p class="sublabel mb-1">Fighter Runemarks</p>
			<div class="flex flex-col gap-2">
				{#each [0, 1, 2] as i}
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

	<!-- Characteristics -->
	<section>
		<p class="field-label mb-2">Characteristics</p>
		<div class="grid grid-cols-5 gap-2">
			<div>
				<label class="sublabel" for="baseSize">Base Size</label>
				<input id="baseSize" class="field-input text-center" bind:value={data.baseSize} />
			</div>
			<div>
				<label class="sublabel" for="points">Points Value</label>
				<input id="points" class="field-input text-center" bind:value={data.points} />
			</div>
			<div>
				<label class="sublabel" for="move">Move (M)</label>
				{#if data.isMonster}
					<input id="move" class="field-input text-center opacity-40 cursor-not-allowed" value="*" disabled />
				{:else}
					<input id="move" class="field-input text-center" bind:value={data.move} />
				{/if}
			</div>
			<div>
				<label class="sublabel" for="toughness">Toughness (T)</label>
				<input id="toughness" class="field-input text-center" bind:value={data.toughness} />
			</div>
			<div>
				<label class="sublabel" for="wounds">Wounds (W)</label>
				<input id="wounds" class="field-input text-center" bind:value={data.wounds} />
			</div>
		</div>
	</section>

	<!-- Weapons -->
	{#each data.weapons as weapon, i}
		<section>
			<p class="field-label mb-2">Weapon {i + 1}</p>
			<div class="grid grid-cols-5 gap-2">
				<div>
					<span class="sublabel">Type</span>
					<select class="field-input text-center" bind:value={weapon.name}>
						<option value="">—</option>
						<option value="Axe">Axe</option>
						<option value="Bident">Bident</option>
						<option value="Blast">Blast</option>
						<option value="Claws">Claws</option>
						<option value="Club">Club</option>
						<option value="Dagger">Dagger</option>
						<option value="Fangs">Fangs</option>
						<option value="Hammer">Hammer</option>
						<option value="Hook">Hook</option>
						<option value="Mace">Mace</option>
						<option value="Pistol">Pistol</option>
						<option value="Ranged Weapon">Ranged Weapon</option>
						<option value="Reach Weapon">Reach Weapon</option>
						<option value="Scythe">Scythe</option>
						<option value="Spear">Spear</option>
						<option value="Sword">Sword</option>
						<option value="Unarmed">Unarmed</option>
					</select>
				</div>
				<div>
					<span class="sublabel">Range (RNG)</span>
					<input class="field-input text-center" bind:value={weapon.range} placeholder="1" />
				</div>
				<div>
					<span class="sublabel">Attacks (A)</span>
					<input class="field-input text-center" bind:value={weapon.attacks} placeholder="3" />
				</div>
				<div>
					<span class="sublabel">Strength (S)</span>
					<input class="field-input text-center" bind:value={weapon.strength} placeholder="4" />
				</div>
				<div>
					<span class="sublabel">Damage (DMG)</span>
					{#if data.isMonster}
						<input class="field-input text-center opacity-40 cursor-not-allowed" value="*" disabled />
					{:else}
						<input class="field-input text-center" bind:value={weapon.damage} placeholder="2/4" />
					{/if}
				</div>
			</div>
		</section>
	{/each}

	<!-- Damage brackets -->
	{#if data.isMonster}
		<section>
			<p class="field-label mb-2">Damage Brackets</p>
			<div class="space-y-2">
				<div class="grid grid-cols-3 gap-1">
					<span class="sublabel">Wounds Taken</span>
					<span class="sublabel text-center">Move (M)</span>
					<span class="sublabel text-center">Damage (DMG)</span>
				</div>
				{#each data.damageBrackets as bracket}
					<div class="grid grid-cols-3 gap-1 items-center">
						<input class="field-input" bind:value={bracket.damageRange} placeholder="0–3" />
						<input class="field-input text-center" bind:value={bracket.move} placeholder="6" />
						<input class="field-input text-center" bind:value={bracket.damage} placeholder="6/12" />
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.field-label {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #9ca3af;
		margin-bottom: 0.375rem;
	}

	.sublabel {
		display: block;
		font-size: 0.65rem;
		color: #9ca3af;
		margin-bottom: 2px;
	}

	.field-input {
		width: 100%;
		box-sizing: border-box;
		appearance: none;
		background: #27272a;
		border: 1px solid #3f3f46;
		border-radius: 6px;
		padding: 6px 10px;
		color: #e4e4e7;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.field-input:focus {
		border-color: #7f1d1d;
	}
</style>
