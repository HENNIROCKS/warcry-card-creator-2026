<svelte:head>
	<title>Fighter Card — Warcry Card Creator</title>
</svelte:head>

<script lang="ts">
	import { base } from '$app/paths';
	import type { FighterCardData } from '$lib/types';
	import FighterCard from '$lib/components/FighterCard.svelte';
	import FighterForm from '$lib/components/FighterForm.svelte';
	let cardEl: HTMLElement;
	let exporting = $state(false);
	let printerFriendly = $state(false);
	let showDropdown = $state(false);
	let viewportHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 900);
	let viewportWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	$effect(() => {
		const onResize = () => { viewportHeight = window.innerHeight; viewportWidth = window.innerWidth; };
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});
	const cardScale = $derived(Math.min(1, (viewportHeight - 64) / 915));
	const isRestricted = $derived(viewportWidth < 640 || (viewportWidth < 1024 && viewportHeight > viewportWidth));

	let data = $state<FighterCardData>({
		name: 'FIGHTER NAME',
		subtitle: '',
		modelImage: null,
		imageOffsetX: 50,
		imageOffsetY: 50,
		imageZoom: 1,
		imageCaption: '',
		grandAlliance: '',
		faction: '',
		bladeborn: '',
		rightRunemarks: [],
		baseSize: '⌀ 32',
		points: '100',
		move: '4',
		toughness: '4',
		wounds: '10',
		weapons: [
			{ name: '', range: '1', attacks: '3', strength: '4', damage: '2/4' },
			{ name: '', range: '1', attacks: '2', strength: '3', damage: '1/3' }
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

	function makeSlug() {
		const slug = (data.name || 'fighter').toLowerCase().replace(/\s+/g, '-');
		const now = new Date();
		const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
		return `${slug}_${ts}`;
	}

	async function doExport(suffix: string) {
		if (!cardEl || exporting) return;
		exporting = true;
		try {
			const domtoimage = (await import('dom-to-image-more')).default;
			const dataUrl = await domtoimage.toPng(cardEl, { scale: 2 });
			const a = document.createElement('a');
			a.href = dataUrl;
			a.download = `${makeSlug()}${suffix}.png`;
			a.click();
		} finally {
			exporting = false;
		}
	}

	async function exportCard() {
		await doExport('');
	}

	async function exportPrinterFriendly() {
		showDropdown = false;
		printerFriendly = true;
		await new Promise(r => requestAnimationFrame(r));
		await doExport('_print');
		printerFriendly = false;
	}
</script>

{#if isRestricted}
<div class="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center gap-4 p-8 text-center">
	<p class="text-zinc-300">This tool requires a tablet in landscape orientation or a larger screen. Mobile support may come in a future update.</p>
	<a href="{base}/" class="text-zinc-500 hover:text-white text-sm transition">← Back</a>
</div>
{:else}
<div class="flex h-screen bg-zinc-900 text-white">
	<!-- LEFT: Form panel -->
	<aside class="flex w-[480px] shrink-0 flex-col border-r border-zinc-800 h-full">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0">
			<div class="flex items-center gap-3">
				<a href="{base}/" class="text-zinc-500 transition hover:text-white" aria-label="Back">←</a>
				<h1 class="text-sm font-semibold tracking-widest text-zinc-200 uppercase">Fighter Card</h1>
			</div>
			<div class="relative">
				<div class="flex rounded-md overflow-hidden">
					<button
						onclick={exportCard}
						disabled={exporting}
						class="bg-red-800 px-4 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-red-700 disabled:opacity-50"
					>
						{exporting ? 'Exporting…' : 'Export PNG'}
					</button>
					<button
						onclick={() => showDropdown = !showDropdown}
						disabled={exporting}
						class="bg-red-800 border-l border-red-900 px-2 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
						aria-label="More export options"
					>
						<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>
					</button>
				</div>
				{#if showDropdown}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="absolute right-0 top-full mt-1 z-10 min-w-max rounded-md bg-zinc-800 border border-zinc-700 shadow-lg"
						onmouseleave={() => showDropdown = false}
					>
						<button
							onclick={exportPrinterFriendly}
							class="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded-md"
						>
							Export printer-friendly PNG
						</button>
					</div>
				{/if}
			</div>
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
				<FighterCard {data} {printerFriendly} />
			</div>
		</div>
	</main>
</div>
{/if}
