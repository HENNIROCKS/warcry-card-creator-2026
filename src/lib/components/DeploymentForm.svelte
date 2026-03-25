<script lang="ts">
	import { t } from '$lib/i18n/index.svelte';
	import type {
		DeploymentCardData,
		DeploymentColor,
		DeploymentDirection,
		DeploymentIconType,
		DeploymentPosition,
		ZonePreset,
	} from '$lib/types';

	let {
		data,
		snapGridActive = false,
		onAddMeasurement = undefined,
	}: {
		data: DeploymentCardData;
		snapGridActive?: boolean;
		onAddMeasurement?: () => void;
	} = $props();

	// -- Position metadata -------------------------------------------------------

	const insidePositions: DeploymentPosition[] = ['TL', 'TC', 'TR', 'ML', 'CC', 'MR', 'BL', 'BC', 'BR'];
	const outsidePositions: DeploymentPosition[] = [
		'OUT-TL',     'OUT-TC',     'OUT-TR',
		'OUT-LT',     'OUT-LC',     'OUT-LB',
		'OUT-RT',     'OUT-RC',     'OUT-RB',
		'OUT-BL',     'OUT-BC',     'OUT-BR',
		'OUT-CNR-TL', 'OUT-CNR-TR', 'OUT-CNR-BL', 'OUT-CNR-BR',
	];

	// -- Zone + measurement metadata ---------------------------------------------

	const zonePresets: ZonePreset[] = [
		'top-half', 'bottom-half', 'left-half', 'right-half',
		'tl-quarter', 'tr-quarter', 'bl-quarter', 'br-quarter',
	];

	const directions: DeploymentDirection[] = ['up', 'down', 'left', 'right', 'up-right', 'up-left', 'down-right', 'down-left'];
	const capTypes = ['arrow', 'tick', 'dot', 'none'] as const;

	// -- Icon + colour metadata --------------------------------------------------

	const icons: { value: DeploymentIconType }[] = [
		{ value: 'dagger' },
		{ value: 'hammer' },
		{ value: 'shield' },
	];

	const colorOptions: { value: DeploymentColor; hex: string }[] = [
		{ value: 'red',    hex: '#c0272d' },
		{ value: 'blue',   hex: '#2563eb' },
		{ value: 'green',  hex: '#16a34a' },
		{ value: 'yellow', hex: '#ca8a04' },
	];

	// -- Helpers -----------------------------------------------------------------

	function nextColor(): DeploymentColor {
		const used = new Set(data.players.map(p => p.color));
		return colorOptions.find(c => !used.has(c.value))?.value ?? 'red';
	}

	// Returns '#000' or '#fff' for best contrast against a hex background colour.
	function contrastText(hex: string): string {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#000' : '#fff';
	}

	const positionOrder: DeploymentPosition[] = [
		'CC', 'ML', 'MR', 'TC', 'BC', 'TL', 'TR', 'BL', 'BR',
		...outsidePositions,
	];

	function findFreePosition(excludePlayer: number, excludePoint: number): DeploymentPosition {
		const used = usedPositions(excludePlayer, excludePoint);
		return positionOrder.find(p => !used.has(p)) ?? 'CC';
	}

	function addPlayer() {
		// Find first free position before the new player is added to the array.
		const position = findFreePosition(-1, -1);
		data.players = [...data.players, {
			color: nextColor(),
			zones: [],
			points: [{ position, icon: 'dagger', rnd: '' }],
		}];
	}

	function removePlayer(pi: number) {
		data.players = data.players.filter((_, i) => i !== pi);
	}

	function addPoint(pi: number) {
		const position = findFreePosition(pi, -1);
		data.players[pi].points = [
			...data.players[pi].points,
			{ position, icon: 'dagger', rnd: '' },
		];
	}

	function addZone(pi: number) {
		data.players[pi].zones = [...(data.players[pi].zones ?? []), { preset: 'top-half' }];
	}

	function removeZone(pi: number, zi: number) {
		data.players[pi].zones = data.players[pi].zones.filter((_, i) => i !== zi);
	}

	function removeMeasurement(mi: number) {
		data.measurements = data.measurements.filter((_, i) => i !== mi);
	}

	function removePoint(pi: number, pti: number) {
		data.players[pi].points = data.players[pi].points.filter((_, i) => i !== pti);
	}

	// Positions already occupied, excluding a specific point so it can keep its own slot.
	function usedPositions(excludePlayer: number, excludePoint: number): Set<string> {
		const used = new Set<string>();
		for (let pi = 0; pi < data.players.length; pi++) {
			for (let pti = 0; pti < data.players[pi].points.length; pti++) {
				if (pi === excludePlayer && pti === excludePoint) continue;
				used.add(data.players[pi].points[pti].position);
			}
		}
		return used;
	}
</script>

<div class="space-y-10 text-sm">

	<!-- Card name -->
	<section>
		<label class="field-label">{t('ui.form-card')} <span class="normal-case font-normal text-zinc-500">— {t('ui.form-hint-caption')}</span></label>
		<input
			type="text"
			bind:value={data.name}
			placeholder={t('ui.form-placeholder-deployment')}
			class="field-input"
		/>
	</section>

	<!-- Players -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<span class="field-label" style="margin-bottom:0">{t('ui.form-players')}</span>
			<button
				onclick={addPlayer}
				disabled={data.players.length >= 4}
				class="rounded bg-red-800 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
			>{t('ui.form-add-player')}</button>
		</div>

		<div class="flex flex-col gap-4">
			{#each data.players as player, pi}
				{@const col = colorOptions.find(c => c.value === player.color)!}

				<div class="flex flex-col gap-3 rounded-md border bg-zinc-800/50 p-3" style="border-color: {col.hex}44">

					<!-- Player header -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<!-- Colour picker -->
							<div class="flex gap-1.5">
								{#each colorOptions as opt}
									{@const takenByOther = data.players.some((p, i) => i !== pi && p.color === opt.value)}
									<button
										onclick={() => player.color = opt.value}
										disabled={takenByOther}
										style="background: {opt.hex}; outline-color: {player.color === opt.value ? opt.hex : 'transparent'}"
										class="w-6 h-6 rounded-full outline outline-2 outline-offset-1 transition-[outline-color] disabled:opacity-25 disabled:cursor-not-allowed"
										aria-label={t('ui.color-' + opt.value)}
									></button>
								{/each}
							</div>
							<span class="field-label" style="color: {col.hex}; margin-bottom:0">{t('ui.color-' + col.value)}</span>
						</div>
						<button
							onclick={() => removePlayer(pi)}
							class="rounded px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-700 hover:text-red-400"
						>{t('ui.form-remove')}</button>
					</div>

					<!-- Points for this player -->
					<div class="flex flex-col gap-2">
						{#each player.points as point, pti}
							{@const taken = usedPositions(pi, pti)}
							<div class="flex flex-col gap-2 rounded border border-zinc-600 bg-zinc-800 p-2.5">

								<div class="flex items-center justify-between">
									<span class="field-label" style="color: {col.hex}; margin-bottom:0">{t('ui.form-point-n', { n: String(pti + 1) })}</span>
									<button
										onclick={() => removePoint(pi, pti)}
										class="rounded px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-700 hover:text-red-400"
									>✕</button>
								</div>

								<!-- Position -->
								<select
									bind:value={point.position}
									class="field-input"
								>
									<optgroup label={t('ui.form-position-inside')}>
										{#each insidePositions as pos}
											<option value={pos} disabled={taken.has(pos)}>{t('deployment.pos-' + pos)}{taken.has(pos) ? ' ✕' : ''}</option>
										{/each}
									</optgroup>
									<optgroup label={t('ui.form-position-outside')}>
										{#each outsidePositions as pos}
											<option value={pos} disabled={taken.has(pos)}>{t('deployment.pos-' + pos)}{taken.has(pos) ? ' ✕' : ''}</option>
										{/each}
									</optgroup>
								</select>

								<!-- Icon buttons -->
								<div class="flex gap-1">
									{#each icons as ic}
										<button
											onclick={() => point.icon = ic.value}
											class="flex-1 rounded py-2 text-sm font-semibold transition {point.icon === ic.value
												? ''
												: 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}"
											style={point.icon === ic.value ? `background: ${col.hex}; color: ${contrastText(col.hex)}` : ''}
										>{t('deployment.' + ic.value)}</button>
									{/each}
								</div>

								<!-- RND -->
								<input
									type="text"
									bind:value={point.rnd}
									placeholder={t('ui.form-round-placeholder')}
									class="field-input"
								/>

							</div>
						{/each}

						<button
							onclick={() => addPoint(pi)}
							class="w-full rounded border border-dashed border-zinc-600 py-2 text-sm text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-300"
						>{t('ui.form-add-point')}</button>
					</div>

					<!-- Zones for this player -->
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between">
							<span class="field-label" style="margin-bottom:0">{t('ui.form-zones')}</span>
							<button
								onclick={() => addZone(pi)}
								class="rounded bg-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-600"
							>{t('ui.form-add-zone')}</button>
						</div>
						{#each (player.zones ?? []) as zone, zi}
							<div class="flex items-center gap-2">
								<select bind:value={zone.preset} class="field-input flex-1">
									{#each zonePresets as p}
										<option value={p}>{t('deployment.zone-' + p)}</option>
									{/each}
								</select>
								<button
									onclick={() => removeZone(pi, zi)}
									class="rounded px-2 py-1 text-sm text-zinc-400 transition hover:bg-zinc-700 hover:text-red-400"
								>✕</button>
							</div>
						{/each}
					</div>

				</div>
			{/each}
		</div>

		{#if data.players.length === 0}
			<p class="mt-2 text-center text-sm text-zinc-500">{t('ui.form-no-players')}</p>
		{/if}
	</section>

	<!-- Measurements (card-level, neutral) -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<span class="field-label" style="margin-bottom:0">{t('ui.form-measurements')}</span>
			<button
				onclick={() => onAddMeasurement?.()}
				class="rounded bg-red-800 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700"
			>{t('ui.form-add-measurement')}</button>
		</div>

		<div class="flex flex-col gap-3">
			{#each (data.measurements ?? []) as m, mi}
				<div class="flex flex-col gap-2 rounded border border-zinc-600 bg-zinc-800 p-2.5">
					<div class="flex items-center justify-between">
						<span class="field-label" style="margin-bottom:0; color: var(--ui-muted)">#{mi + 1}</span>
						<button
							onclick={() => removeMeasurement(mi)}
							class="rounded px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-700 hover:text-red-400"
						>✕</button>
					</div>

					<!-- Direction + Length -->
					<div class="flex gap-2">
						<div class="flex-1">
							<span class="field-label" style="margin-bottom:2px">{t('ui.form-measurement-direction')}</span>
							<select bind:value={m.direction} class="field-input">
								{#each directions as d}
									<option value={d}>{t('deployment.dir-' + d)}</option>
								{/each}
							</select>
						</div>
						<div class="flex-1">
							<span class="field-label" style="margin-bottom:2px">{t('ui.form-measurement-length')}</span>
							<input
								type="number"
								bind:value={m.length}
								min="10" step="5"
								class="field-input"
							/>
						</div>
					</div>

					<!-- Label -->
					<input
						type="text"
						bind:value={m.label}
						placeholder={t('ui.form-measurement-label')}
						class="field-input"
					/>

					<!-- Start / End caps -->
					<div class="flex gap-2">
						<div class="flex-1">
							<span class="field-label" style="margin-bottom:2px">{t('ui.form-measurement-start-cap')}</span>
							<select bind:value={m.startCap} class="field-input">
								{#each capTypes as c}
									<option value={c}>{t('deployment.cap-' + c)}</option>
								{/each}
							</select>
						</div>
						<div class="flex-1">
							<span class="field-label" style="margin-bottom:2px">{t('ui.form-measurement-end-cap')}</span>
							<select bind:value={m.endCap} class="field-input">
								{#each capTypes as c}
									<option value={c}>{t('deployment.cap-' + c)}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			{/each}

			{#if snapGridActive}
				<p class="mt-2 text-center text-sm text-zinc-500">{t('ui.form-snap-hint')}</p>
			{:else if (data.measurements ?? []).length === 0}
				<p class="mt-2 text-center text-sm text-zinc-500">{t('ui.form-no-measurements')}</p>
			{/if}
		</div>
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
