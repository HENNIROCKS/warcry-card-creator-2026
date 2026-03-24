<script lang="ts">
	import type {
		DeploymentCardData,
		DeploymentColor,
		DeploymentIconType,
		DeploymentPosition,
	} from '$lib/types';

	let { data }: { data: DeploymentCardData } = $props();

	// -- Position metadata -------------------------------------------------------

	const positionLabels: Record<DeploymentPosition, string> = {
		TL: 'Top Left',    TC: 'Top Centre',    TR: 'Top Right',
		ML: 'Mid Left',    CC: 'Centre',         MR: 'Mid Right',
		BL: 'Bottom Left', BC: 'Bottom Centre',  BR: 'Bottom Right',
		'OUT-TL': 'Outside Top Left',    'OUT-TC': 'Outside Top Centre',    'OUT-TR': 'Outside Top Right',
		'OUT-LT': 'Outside Left Top',    'OUT-LC': 'Outside Left Centre',   'OUT-LB': 'Outside Left Bottom',
		'OUT-RT': 'Outside Right Top',   'OUT-RC': 'Outside Right Centre',  'OUT-RB': 'Outside Right Bottom',
		'OUT-BL': 'Outside Bottom Left', 'OUT-BC': 'Outside Bottom Centre', 'OUT-BR': 'Outside Bottom Right',
		'OUT-CNR-TL': 'Corner Top Left', 'OUT-CNR-TR': 'Corner Top Right',
		'OUT-CNR-BL': 'Corner Bottom Left', 'OUT-CNR-BR': 'Corner Bottom Right',
	};

	const insidePositions: DeploymentPosition[] = ['TL', 'TC', 'TR', 'ML', 'CC', 'MR', 'BL', 'BC', 'BR'];
	const outsidePositions: DeploymentPosition[] = [
		'OUT-TL',     'OUT-TC',     'OUT-TR',
		'OUT-LT',     'OUT-LC',     'OUT-LB',
		'OUT-RT',     'OUT-RC',     'OUT-RB',
		'OUT-BL',     'OUT-BC',     'OUT-BR',
		'OUT-CNR-TL', 'OUT-CNR-TR', 'OUT-CNR-BL', 'OUT-CNR-BR',
	];

	// -- Icon + colour metadata --------------------------------------------------

	const icons: { value: DeploymentIconType; label: string }[] = [
		{ value: 'dagger', label: 'Dagger' },
		{ value: 'hammer', label: 'Hammer' },
		{ value: 'shield', label: 'Shield' },
	];

	const colorOptions: { value: DeploymentColor; hex: string; label: string }[] = [
		{ value: 'red',    hex: '#c0272d', label: 'Red'    },
		{ value: 'blue',   hex: '#2563eb', label: 'Blue'   },
		{ value: 'green',  hex: '#16a34a', label: 'Green'  },
		{ value: 'yellow', hex: '#ca8a04', label: 'Yellow' },
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
			points: [{ position, icon: 'dagger', rnd: '', measurements: [] }],
		}];
	}

	function removePlayer(pi: number) {
		data.players = data.players.filter((_, i) => i !== pi);
	}

	function addPoint(pi: number) {
		const position = findFreePosition(pi, -1);
		data.players[pi].points = [
			...data.players[pi].points,
			{ position, icon: 'dagger', rnd: '', measurements: [] },
		];
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

<div class="flex flex-col gap-6">

	<!-- Card name -->
	<div class="flex flex-col gap-1.5">
		<label class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Name</label>
		<input
			type="text"
			bind:value={data.name}
			placeholder="Deployment card name"
			class="w-full rounded bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-red-700"
		/>
	</div>

	<!-- Players -->
	<div class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<span class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Players</span>
			<button
				onclick={addPlayer}
				disabled={data.players.length >= 4}
				class="rounded bg-red-800 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
			>+ Add Player</button>
		</div>

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
									aria-label={opt.label}
								></button>
							{/each}
						</div>
						<span class="text-xs font-bold uppercase tracking-widest" style="color: {col.hex}">{col.label}</span>
					</div>
					<button
						onclick={() => removePlayer(pi)}
						class="rounded px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-700 hover:text-red-400"
					>Remove</button>
				</div>

				<!-- Points for this player -->
				<div class="flex flex-col gap-2">
					{#each player.points as point, pti}
						{@const taken = usedPositions(pi, pti)}
						<div class="flex flex-col gap-2 rounded border border-zinc-600 bg-zinc-800 p-2.5">

							<div class="flex items-center justify-between">
								<span class="text-xs font-semibold uppercase tracking-widest" style="color: {col.hex}">Point {pti + 1}</span>
								<button
									onclick={() => removePoint(pi, pti)}
									class="rounded px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-700 hover:text-red-400"
								>✕</button>
							</div>

							<!-- Position -->
							<select
								bind:value={point.position}
								class="w-full rounded bg-zinc-700 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-red-700"
							>
								<optgroup label="Inside">
									{#each insidePositions as pos}
										<option value={pos} disabled={taken.has(pos)}>{positionLabels[pos]}{taken.has(pos) ? ' ✕' : ''}</option>
									{/each}
								</optgroup>
								<optgroup label="Outside">
									{#each outsidePositions as pos}
										<option value={pos} disabled={taken.has(pos)}>{positionLabels[pos]}{taken.has(pos) ? ' ✕' : ''}</option>
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
									>{ic.label}</button>
								{/each}
							</div>

							<!-- RND -->
							<input
								type="text"
								bind:value={point.rnd}
								placeholder="Round (e.g. RND 2)"
								class="w-full rounded bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-red-700"
							/>

						</div>
					{/each}

					<button
						onclick={() => addPoint(pi)}
						class="w-full rounded border border-dashed border-zinc-600 py-2 text-sm text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-300"
					>+ Add Point</button>
				</div>

			</div>
		{/each}

		{#if data.players.length === 0}
			<p class="text-center text-sm text-zinc-500">No players yet.</p>
		{/if}
	</div>

</div>
