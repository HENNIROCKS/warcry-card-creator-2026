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
		<!-- Export button: mobile only, above card -->
		<div class="lg:hidden mb-6 relative">
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

		<!-- Explicit-dimension wrapper so flex sees the visual size, not the 915px layout box -->
		<div style="width: {574 * cardScale}px; height: {915 * cardScale}px; position: relative; flex-shrink: 0;">
			<div style="transform: scale({cardScale}); transform-origin: top left; position: absolute; top: 0; left: 0; display: inline-block; line-height: 0;">
				<div bind:this={cardEl} style="display:inline-block; line-height:0; border:0; outline:none; background:transparent;">
					<FighterCard {data} {printerFriendly} />
				</div>
			</div>
		</div>
	</main>

</div>
