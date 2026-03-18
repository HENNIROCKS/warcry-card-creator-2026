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
	let activeTab = $state<'edit' | 'preview'>('edit');
	let adjustMode = $state(false);
	let viewportHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 900);
	let viewportWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	$effect(() => {
		const onResize = () => { viewportHeight = window.innerHeight; viewportWidth = window.innerWidth; };
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});
	const isMobile = $derived(viewportWidth < 1024);
	$effect(() => {
		if (!showDropdown) return;
		const close = () => { showDropdown = false; };
		const id = setTimeout(() => document.addEventListener('click', close), 0);
		return () => { clearTimeout(id); document.removeEventListener('click', close); };
	});
	const cardScale = $derived(
		isMobile
			? Math.min(1, (viewportWidth - 32) / 574)
			: Math.min(1, (viewportHeight - 64) / 915)
	);

	// Image area is ~55% of card height (503px at 915px card)
	const imageAreaHeight = 503;

	interface TouchState {
		mode: 'idle' | 'drag' | 'pinch';
		startX: number;
		startY: number;
		startOffsetX: number;
		startOffsetY: number;
		startDist: number;
		startZoom: number;
	}
	let touchState: TouchState = { mode: 'idle', startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0, startDist: 0, startZoom: 1 };

	function getTouchDist(touches: TouchList): number {
		const dx = touches[0].clientX - touches[1].clientX;
		const dy = touches[0].clientY - touches[1].clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			touchState = { ...touchState, mode: 'drag', startX: e.touches[0].clientX, startY: e.touches[0].clientY, startOffsetX: data.imageOffsetX, startOffsetY: data.imageOffsetY };
		} else if (e.touches.length === 2) {
			touchState = { ...touchState, mode: 'pinch', startDist: getTouchDist(e.touches), startZoom: data.imageZoom };
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (touchState.mode === 'drag' && e.touches.length === 1) {
			const dx = (e.touches[0].clientX - touchState.startX) / cardScale;
			const dy = (e.touches[0].clientY - touchState.startY) / cardScale;
			data.imageOffsetX = Math.max(0, Math.min(100, touchState.startOffsetX - dx * (50 / 574)));
			data.imageOffsetY = Math.max(0, Math.min(100, touchState.startOffsetY - dy * (50 / imageAreaHeight)));
		} else if (touchState.mode === 'pinch' && e.touches.length === 2) {
			const newDist = getTouchDist(e.touches);
			data.imageZoom = Math.max(1, Math.min(3, touchState.startZoom * (newDist / touchState.startDist)));
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (e.touches.length === 0) {
			touchState.mode = 'idle';
		} else if (e.touches.length === 1 && touchState.mode === 'pinch') {
			touchState = { ...touchState, mode: 'drag', startX: e.touches[0].clientX, startY: e.touches[0].clientY, startOffsetX: data.imageOffsetX, startOffsetY: data.imageOffsetY };
		}
	}

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

<div class="flex flex-col h-dvh bg-zinc-900 text-white overflow-hidden lg:flex-row">

	<!-- Mobile tab bar -->
	<nav class="lg:hidden flex shrink-0">
		<button
			class="flex-1 py-4 text-sm font-bold tracking-widest uppercase transition {activeTab === 'edit' ? 'bg-red-800 text-white' : 'bg-zinc-950 text-zinc-500'}"
			onclick={() => activeTab = 'edit'}
		>Edit</button>
		<button
			class="flex-1 py-4 text-sm font-bold tracking-widest uppercase transition {activeTab === 'preview' ? 'bg-red-800 text-white' : 'bg-zinc-950 text-zinc-500'}"
			onclick={() => activeTab = 'preview'}
		>Preview</button>
	</nav>

	<!-- LEFT: Form panel -->
	<aside
		class="flex flex-col border-zinc-800 w-full flex-1 min-h-0 lg:w-[480px] lg:flex-none lg:shrink-0 lg:border-r lg:h-full"
		style:display={isMobile && activeTab !== 'edit' ? 'none' : 'flex'}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0">
			<div class="flex items-center gap-3">
				<a href="{base}/" class="text-zinc-500 transition hover:text-white" aria-label="Back">←</a>
				<h1 class="text-sm font-semibold tracking-widest text-zinc-200 uppercase">Fighter Card</h1>
			</div>
			<div class="relative hidden lg:block">
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
	<main
		class="flex flex-col flex-1 min-h-0 items-center justify-start overflow-y-auto pt-6 lg:justify-center lg:pt-0 lg:h-full lg:overflow-hidden"
		style:display={isMobile && activeTab !== 'preview' ? 'none' : 'flex'}
	>
		<!-- Export button + adjust toggle: mobile only, above card -->
		<div class="lg:hidden mb-4 flex items-center gap-3">
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
						class="absolute left-0 top-full mt-1 z-10 min-w-max rounded-md bg-zinc-800 border border-zinc-700 shadow-lg"
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

			{#if data.modelImage}
				<button
					onclick={() => adjustMode = !adjustMode}
					class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition {adjustMode ? 'bg-red-800 text-white' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'}"
				>
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/>
						<polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/>
						<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
					</svg>
					{adjustMode ? 'Done' : 'Adjust Image'}
				</button>
			{/if}
		</div>

		<!-- Explicit-dimension wrapper so flex sees the visual size, not the 915px layout box -->
		<div style="width: {574 * cardScale}px; height: {915 * cardScale}px; position: relative; flex-shrink: 0;">
			<div style="transform: scale({cardScale}); transform-origin: top left; position: absolute; top: 0; left: 0; display: inline-block; line-height: 0;">
				<div bind:this={cardEl} style="display:inline-block; line-height:0; border:0; outline:none; background:transparent;">
					<FighterCard {data} {printerFriendly} />
				</div>
			</div>

			<!-- Touch overlay for image positioning (mobile only) -->
			{#if adjustMode && data.modelImage}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					style="position: absolute; top: 0; left: 0; width: 100%; height: {imageAreaHeight * cardScale}px; z-index: 10; touch-action: none; cursor: grab;"
					ontouchstart={handleTouchStart}
					ontouchmove={handleTouchMove}
					ontouchend={handleTouchEnd}
				>
					<div class="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
						<svg class="w-10 h-10 text-white opacity-60 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/>
							<polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/>
							<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
						</svg>
					</div>
				</div>
			{/if}
		</div>
	</main>

</div>
