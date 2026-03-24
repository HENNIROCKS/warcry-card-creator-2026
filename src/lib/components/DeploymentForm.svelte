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

	const colorOptions: { value: DeploymentColor; hex: string }[] = [
		{ value: 'red',    hex: '#c0272d' },
		{ value: 'blue',   hex: '#2563eb' },
		{ value: 'green',  hex: '#16a34a' },
		{ value: 'yellow', hex: '#ca8a04' },
	];

	// -- Helpers -----------------------------------------------------------------

	function addPoint() {
		data.points = [
			...data.points,
			{ position: 'CC', icon: 'dagger', color: 'red', rnd: '', measurements: [] },
		];
	}

	function removePoint(i: number) {
		data.points = data.points.filter((_, idx) => idx !== i);
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

	<!-- Deployment points -->
	<div class="flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<span class="text-xs font-semibold uppercase tracking-widest text-zinc-400">Deployment Points</span>
			<button
				onclick={addPoint}
				class="rounded bg-red-800 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
			>+ Add</button>
		</div>

		{#each data.points as point, i}
			<div class="flex flex-col gap-3 rounded-md border border-zinc-700 bg-zinc-800/50 p-3">

				<!-- Header: point number + remove -->
				<div class="flex items-center justify-between">
					<span class="text-xs font-bold uppercase tracking-widest text-zinc-300">Point {i + 1}</span>
					<button
						onclick={() => removePoint(i)}
						class="rounded px-2 py-0.5 text-xs text-zinc-500 transition hover:bg-zinc-700 hover:text-red-400"
					>Remove</button>
				</div>

				<!-- Position -->
				<div class="flex flex-col gap-1">
					<label class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Position</label>
					<select
						bind:value={point.position}
						class="w-full rounded bg-zinc-700 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-red-700"
					>
						<optgroup label="Inside">
							{#each insidePositions as pos}
								<option value={pos}>{positionLabels[pos]}</option>
							{/each}
						</optgroup>
						<optgroup label="Outside">
							{#each outsidePositions as pos}
								<option value={pos}>{positionLabels[pos]}</option>
							{/each}
						</optgroup>
					</select>
				</div>

				<!-- Icon -->
				<div class="flex flex-col gap-1">
					<label class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Icon</label>
					<div class="flex gap-1">
						{#each icons as ic}
							<button
								onclick={() => point.icon = ic.value}
								class="flex-1 rounded py-1.5 text-xs font-semibold transition {point.icon === ic.value
									? 'bg-red-800 text-white'
									: 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}"
							>{ic.label}</button>
						{/each}
					</div>
				</div>

				<!-- Colour -->
				<div class="flex flex-col gap-1">
					<label class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Colour</label>
					<div class="flex gap-2.5 mt-1">
						{#each colorOptions as col}
							<button
								onclick={() => point.color = col.value}
								style="background: {col.hex}; border-color: {point.color === col.value ? '#ef4444' : 'transparent'}"
								class="w-7 h-7 rounded-full border-2 cursor-pointer transition-[border-color]"
								aria-label={col.value}
							></button>
						{/each}
					</div>
				</div>

				<!-- RND -->
				<div class="flex flex-col gap-1">
					<label class="text-xs font-semibold uppercase tracking-widest text-zinc-500">Round</label>
					<input
						type="text"
						bind:value={point.rnd}
						placeholder="e.g. RND 2"
						class="w-full rounded bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-red-700"
					/>
				</div>

			</div>
		{/each}

		{#if data.points.length === 0}
			<p class="text-center text-xs text-zinc-600">No deployment points yet.</p>
		{/if}
	</div>

</div>
