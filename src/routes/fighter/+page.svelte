<script lang="ts">
	import type { FighterCardData } from '$lib/types';
	import FighterCard from '$lib/components/FighterCard.svelte';
	import FighterForm from '$lib/components/FighterForm.svelte';
	let cardEl: HTMLElement;
	let exporting = $state(false);
	let viewportHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 900);
	$effect(() => {
		const onResize = () => { viewportHeight = window.innerHeight; };
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});
	const cardScale = $derived(Math.min(1, (viewportHeight - 64) / 915));

	let data = $state<FighterCardData>({
		name: 'FIGHTER NAME',
		modelImage: null,
		imageOffsetX: 50,
		imageOffsetY: 50,
		imageZoom: 1,
		grandAlliance: '',
		faction: '',
		bladeborn: '',
		rightRunemarks: [],
		baseSize: '32',
		points: '100',
		move: '4',
		toughness: '4',
		wounds: '10',
		weapons: [
			{ icon: null, name: '', range: '1', attacks: '3', strength: '4', damage: '2/4' },
			{ icon: null, name: '', range: '1', attacks: '2', strength: '3', damage: '1/3' }
		],
		isNamedCharacter: false,
		isMonster: false,
		showRunemarks: true,
		damageBrackets: [
			{ damageRange: '0–3', move: '6', damage: '6/12' },
			{ damageRange: '4–7', move: '5', damage: '5/10' },
			{ damageRange: '8–11', move: '4', damage: '4/8' },
			{ damageRange: '12–15', move: '3', damage: '3/6' },
			{ damageRange: '16+', move: '2', damage: '2/4' }
		]
	});

	async function exportCard() {
		if (!cardEl || exporting) return;
		exporting = true;
		try {
			const domtoimage = (await import('dom-to-image-more')).default;
			const dataUrl = await domtoimage.toPng(cardEl, { scale: 2 });
			const a = document.createElement('a');
			a.href = dataUrl;
			const slug = (data.name || 'fighter').toLowerCase().replace(/\s+/g, '-');
			const now = new Date();
			const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
			a.download = `${slug}_${ts}.png`;
			a.click();
		} finally {
			exporting = false;
		}
	}
</script>

<div class="flex h-screen bg-zinc-900 text-white">
	<!-- LEFT: Form panel -->
	<aside class="flex w-[480px] shrink-0 flex-col border-r border-zinc-800 h-full">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0">
			<div class="flex items-center gap-3">
				<a href="/" class="text-zinc-500 transition hover:text-white" aria-label="Back">←</a>
				<h1 class="text-sm font-semibold tracking-widest text-zinc-200 uppercase">Fighter Card</h1>
			</div>
			<button
				onclick={exportCard}
				disabled={exporting}
				class="rounded-md bg-red-900 px-3 py-1.5 text-xs font-semibold tracking-wide text-white transition hover:bg-red-800 disabled:opacity-50"
			>
				{exporting ? 'Exporting…' : 'Export PNG'}
			</button>
		</div>

		<!-- Scrollable form -->
		<div class="flex-1 overflow-y-auto p-5">
			<FighterForm {data} />
		</div>
	</aside>

	<!-- RIGHT: Card preview -->
	<main class="flex flex-1 items-center justify-center h-full">
		<div style="transform: scale({cardScale}); transform-origin: center center; display:inline-block; line-height:0;">
			<div bind:this={cardEl} style="display:inline-block; line-height:0; border:0; outline:none; background:transparent;">
				<FighterCard {data} />
			</div>
		</div>
	</main>
</div>
