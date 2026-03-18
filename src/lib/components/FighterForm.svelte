<script lang="ts">
	import type { FighterCardData } from '$lib/types';
	import { fighterRunemarks } from '$lib/runemarks/index';
	import FactionSelect from './FactionSelect.svelte';

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
	<!-- Fighter Name + Subtitle -->
	<section>
		<label class="field-label" for="fighter-name">Fighter <span class="normal-case font-normal text-zinc-500">— use | for a line break</span></label>
		<input
			id="fighter-name"
			class="field-input"
			type="text"
			bind:value={data.name}
			placeholder="FIGHTER"
		/>
		<label class="field-label mt-2" for="fighter-subtitle">Subtitle <span class="normal-case font-normal text-zinc-500">(optional)</span> <span class="normal-case font-normal text-zinc-500">{(data.subtitle ?? '').length}/120</span></label>
		<input
			id="fighter-subtitle"
			class="field-input"
			type="text"
			maxlength="120"
			bind:value={data.subtitle}
		/>
	</section>

	<!-- Checkboxes -->
	<section class="flex flex-col gap-3">
		<label class="flex cursor-pointer items-center gap-3">
			<input type="checkbox" bind:checked={data.isNamedCharacter} class="h-4 w-4 rounded accent-red-800" />
			<span class="text-zinc-120">Named Fighter</span>
		</label>
		<label class="flex cursor-pointer items-center gap-3">
			<input type="checkbox" bind:checked={data.isMonster} class="h-4 w-4 rounded accent-red-800" />
			<span class="text-zinc-120">Monster (Damage Table)</span>
		</label>
		<label class="flex cursor-pointer items-center gap-3">
			<input type="checkbox" bind:checked={data.showRunemarks} class="h-4 w-4 rounded accent-red-800" />
			<span class="text-zinc-120">Show Runemarks</span>
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
				<div class="hidden lg:block space-y-2">
					<div>
						<label class="sublabel" for="img-offset-x">Position X <span class="font-normal">(left/right)</span></label>
						<input id="img-offset-x" type="range" min="0" max="100" bind:value={data.imageOffsetX} class="w-full accent-red-800" />
					</div>
					<div>
						<label class="sublabel" for="img-offset-y">Position Y <span class="font-normal">(down/up)</span></label>
						<input id="img-offset-y" type="range" min="0" max="100" bind:value={data.imageOffsetY} class="w-full accent-red-800" />
					</div>
					<div>
						<label class="sublabel" for="img-zoom">Zoom</label>
						<input id="img-zoom" type="range" min="1" max="3" step="0.05" bind:value={data.imageZoom} class="w-full accent-red-800" />
					</div>
				</div>
				<p class="lg:hidden text-sm text-zinc-300">Adjust image position and zoom in the <strong class="text-white font-semibold">Preview</strong> tab.</p>
				<div>
					<label class="sublabel" for="img-caption">Caption</label>
					<input id="img-caption" class="field-input" type="text" bind:value={data.imageCaption} />
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
		<FactionSelect {data} />
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
		<div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
			<div>
				<label class="sublabel" for="baseSize">Base Size</label>
				<select id="baseSize" class="field-input text-center" style="text-align-last: center" bind:value={data.baseSize}>
					<option>⌀ 20</option>
					<option>⌀ 25</option>
					<option>⌀ 28.5</option>
					<option>⌀ 32</option>
					<option>⌀ 40</option>
					<option>⌀ 50</option>
					<option>⌀ 60</option>
					<option>⌀ 70</option>
					<option>⌀ 80</option>
					<option>⌀ 90</option>
					<option>⌀ 100</option>
					<option>⌀ 120</option>
					<option>⌀ 130</option>
					<option>⌀ 160</option>
					<option>50 × 25</option>
					<option>60 × 35</option>
					<option>75 × 42</option>
					<option>90 × 52</option>
					<option>105 × 70</option>
					<option>120 × 92</option>
					<option>170 × 105</option>
				</select>
			</div>
			<div>
				<label class="sublabel" for="points">Points Value</label>
				<input id="points" class="field-input text-center" placeholder="—" bind:value={data.points} />
			</div>
			<div>
				<label class="sublabel" for="move">Move</label>
				{#if data.isMonster}
					<input id="move" class="field-input text-center opacity-40 cursor-not-allowed" value="*" disabled />
				{:else}
					<input id="move" class="field-input text-center" placeholder="—" bind:value={data.move} />
				{/if}
			</div>
			<div>
				<label class="sublabel" for="toughness">Toughness</label>
				<input id="toughness" class="field-input text-center" placeholder="—" bind:value={data.toughness} />
			</div>
			<div>
				<label class="sublabel" for="wounds">Wounds</label>
				<input id="wounds" class="field-input text-center" placeholder="—" bind:value={data.wounds} />
			</div>
		</div>
	</section>

	<!-- Weapons -->
	{#each data.weapons as weapon, i}
		<section>
			<p class="field-label mb-2">Weapon {i + 1}</p>
			<div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
				<div>
					<span class="sublabel">Type</span>
					<select class="field-input text-center" style="text-align-last: center" bind:value={weapon.name}>
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
					<span class="sublabel">Range</span>
					<input class="field-input text-center" bind:value={weapon.range} placeholder="—" />
				</div>
				<div>
					<span class="sublabel">Attacks</span>
					<input class="field-input text-center" bind:value={weapon.attacks} placeholder="—" />
				</div>
				<div>
					<span class="sublabel">Strength</span>
					<input class="field-input text-center" bind:value={weapon.strength} placeholder="—" />
				</div>
				<div>
					<span class="sublabel">Damage</span>
					{#if data.isMonster}
						<input class="field-input text-center opacity-40 cursor-not-allowed" value={!weapon.range && !weapon.attacks && !weapon.strength ? '—' : '*/*'} disabled />
					{:else}
						<input class="field-input text-center" bind:value={weapon.damage} placeholder="—" />
					{/if}
				</div>
			</div>
		</section>
	{/each}

	<!-- Damage brackets -->
	{#if data.isMonster}
		<section>
			<p class="field-label mb-2">Damage Table</p>
			<div class="space-y-2">
				<div class="grid grid-cols-3 gap-1">
					<span class="sublabel">Damage Points Allocated</span>
					<span class="sublabel text-center">Move</span>
					<span class="sublabel text-center">Damage</span>
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
		font-size: 1rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.field-input:focus {
		border-color: #7f1d1d;
	}
</style>
