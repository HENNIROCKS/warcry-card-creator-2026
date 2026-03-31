<svelte:head>
	<title>Reference Card — Warcry Card Creator</title>
</svelte:head>

<script lang="ts">
	import { base } from '$app/paths';
	import { t } from '$lib/i18n/index.svelte';
	import {
		cardDecksRunemarks, characteristicRunemarks, deploymentRunemarks,
		fighterRunemarks, hierarchy, treasureRunemarks,
		twistsRunemarks, weaponRunemarks,
	} from '$lib/runemarks/index';
	import runemarkShapeRaw from '$lib/runemark-shape.svg?raw';

	const runemarkMaskUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(runemarkShapeRaw)}")`;

	// ── Category data ─────────────────────────────────────────────────────────

	type RmItem = { label: string; svg: string };

	type CoreCat = { id: string; labelKey: string; items: RmItem[] };
	type HierarchyCat = { id: string; labelText: string; items: RmItem[] };

	function fromRecord(rec: Record<string, string>): RmItem[] {
		return Object.entries(rec).map(([label, svg]) => ({ label, svg }));
	}

	const coreCats: CoreCat[] = [
		{ id: 'weapons',         labelKey: 'ui.form-weapon-runemarks',  items: fromRecord(weaponRunemarks) },
		{ id: 'fighters',        labelKey: 'ui.fighters-group',         items: fromRecord(fighterRunemarks) },
		{ id: 'characteristics', labelKey: 'ui.form-characteristics',   items: fromRecord(characteristicRunemarks) },
		{ id: 'deployment',      labelKey: 'ui.deployment-group',       items: fromRecord(deploymentRunemarks) },
		{ id: 'card-decks',      labelKey: 'ui.card-decks-group',       items: fromRecord(cardDecksRunemarks) },
		{ id: 'treasure',        labelKey: 'ui.treasure-group',         items: fromRecord(treasureRunemarks) },
		{ id: 'twists',          labelKey: 'ui.twists-group',           items: fromRecord(twistsRunemarks) },
	];

	const factionCats: HierarchyCat[] = hierarchy.map(alliance => ({
		id: `factions-${alliance.id}`,
		labelText: alliance.label,
		items: [
			{ label: alliance.label, svg: alliance.svg },
			...alliance.factions.flatMap(f => [
				...(f.svg !== null ? [{ label: f.label, svg: f.svg }] : []),
				...f.subfactions.filter(s => s.svg !== null).map(s => ({ label: s.label, svg: s.svg! })),
			]),
		],
	}));

	const allCats: { id: string; items: RmItem[] }[] = [...coreCats, ...factionCats];

	// ── State ─────────────────────────────────────────────────────────────────

	// Fixed 5×8 grid. Rows and columns each 1fr so the grid always fills the full card area.
	const ITEMS_PER_CARD = 40;

	let checked     = $state<Set<string>>(new Set(['weapons']));
	let showCircle  = $state(false);
	let exporting = $state(false);
	let showDropdown = $state(false);
	let printerFriendly = $state(false);
	let activeTab = $state<'edit' | 'preview'>('edit');
	let exportedImageUrl = $state<string | null>(null);
	let viewportHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 900);
	let viewportWidth  = $state(typeof window !== 'undefined' ? window.innerWidth  : 1024);
	let cardEls = $state<HTMLElement[]>([]);

	const isRealMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

	$effect(() => {
		const onResize = () => { viewportHeight = window.innerHeight; viewportWidth = window.innerWidth; };
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	$effect(() => {
		if (!showDropdown) return;
		const close = () => { showDropdown = false; };
		const id = setTimeout(() => document.addEventListener('click', close), 0);
		return () => { clearTimeout(id); document.removeEventListener('click', close); };
	});

	const isMobile  = $derived(viewportWidth < 1024);
	const cardScale = $derived(
		isMobile
			? Math.min(1, (viewportWidth - 32) / 574)
			: Math.min(1, (viewportHeight - 64) / 915)
	);

	const visibleItems = $derived(
		allCats.filter(c => checked.has(c.id)).flatMap(c => c.items)
	);

	const cardPages = $derived((() => {
		const pages: RmItem[][] = [];
		for (let i = 0; i < visibleItems.length; i += ITEMS_PER_CARD) {
			pages.push(visibleItems.slice(i, i + ITEMS_PER_CARD));
		}
		return pages.length > 0 ? pages : [[]];
	})());

	function toggle(id: string) {
		const next = new Set(checked);
		if (next.has(id)) next.delete(id); else next.add(id);
		checked = next;
	}

	// ── Export ────────────────────────────────────────────────────────────────

	async function doExport(suffix: string) {
		exporting = true;
		try {
			const multi = cardEls.length > 1;
			if (isRealMobile) {
				const { domToPng } = await import('modern-screenshot');
				for (let i = 0; i < cardEls.length; i++) {
					const dataUrl = await domToPng(cardEls[i], { width: 574, height: 915, scale: 2 });
					const pageSuffix = multi ? `${suffix}-${i + 1}` : suffix;
					const res  = await fetch(dataUrl);
					const blob = await res.blob();
					const file = new File([blob], `warcry-reference${pageSuffix}.png`, { type: 'image/png' });
					if (navigator.canShare?.({ files: [file] })) {
						await navigator.share({ files: [file] });
					} else {
						exportedImageUrl = dataUrl;
					}
				}
			} else {
				const domtoimage = (await import('dom-to-image-more')).default;
				for (let i = 0; i < cardEls.length; i++) {
					const dataUrl = await domtoimage.toPng(cardEls[i], { scale: 2 });
					const pageSuffix = multi ? `${suffix}-${i + 1}` : suffix;
					const a = document.createElement('a');
					a.href = dataUrl;
					a.download = `warcry-reference${pageSuffix}.png`;
					a.click();
					// small pause so the browser registers each download
					if (i < cardEls.length - 1) await new Promise(r => setTimeout(r, 200));
				}
			}
		} catch {
		} finally {
			exporting = false;
		}
	}

	async function exportCard() { await doExport(''); }

	async function exportPrinterFriendly() {
		showDropdown = false;
		printerFriendly = true;
		await new Promise(r => requestAnimationFrame(r));
		await doExport('_print');
		printerFriendly = false;
	}
</script>

<style>
	.field-label {
		display: block;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ui-field-label);
		margin-bottom: 0.375rem;
	}

	.rm-cell {
		width: 70px;
		height: 70px;
		flex-shrink: 0;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		outline: none;
		background: transparent;
	}

	.rm-cell :global(svg) {
		width: 72%;
		height: 72%;
		display: block;
		flex-shrink: 0;
		border: 0;
		outline: none;
	}

	.rm-badge {
		background: #5a0a14;
		border: 0;
		outline: none;
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.rm-badge :global(svg),
	.rm-badge :global(svg *) {
		fill: #FAF6F3;
	}

	.rm-badge :global(svg) {
		width: 72%;
		height: 72%;
	}

	.rm-border-pf {
		background: #000;
		border: 0;
		outline: none;
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.rm-badge-pf {
		background: #fff;
		width: calc(100% - 2px);
		height: calc(100% - 2px);
	}

	.rm-badge-pf :global(svg),
	.rm-badge-pf :global(svg *) {
		fill: #000;
	}
</style>

<div class="flex flex-col h-dvh bg-zinc-900 text-white overflow-hidden lg:flex-row">

	<!-- Mobile tab bar -->
	<nav class="lg:hidden flex shrink-0">
		<button
			class="flex-1 py-4 text-sm font-bold tracking-widest uppercase transition {activeTab === 'edit' ? 'bg-red-800 text-white' : 'bg-zinc-950 text-zinc-500'}"
			onclick={() => activeTab = 'edit'}
		>{t('ui.tab-edit')}</button>
		<button
			class="flex-1 py-4 text-sm font-bold tracking-widest uppercase transition {activeTab === 'preview' ? 'bg-red-800 text-white' : 'bg-zinc-950 text-zinc-500'}"
			onclick={() => activeTab = 'preview'}
		>{t('ui.tab-preview')}</button>
	</nav>

	<!-- LEFT: Options panel -->
	<aside
		class="flex flex-col border-zinc-800 w-full flex-1 min-h-0 lg:w-[480px] lg:flex-none lg:shrink-0 lg:border-r lg:h-full"
		style:display={isMobile && activeTab !== 'edit' ? 'none' : 'flex'}
	>
		<!-- Panel header -->
		<div class="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0">
			<div class="flex items-center gap-3">
				<a href="{base}/" class="text-zinc-300 rounded px-2 py-1 transition hover:text-white hover:bg-zinc-800" aria-label="Back">←</a>
				<h1 class="text-sm font-semibold tracking-widest text-zinc-200 uppercase">{t('ui.reference-card')}</h1>
			</div>
			<div class="relative hidden lg:block">
				<div class="flex rounded-md overflow-hidden">
					<button
						onclick={exportCard}
						disabled={exporting}
						class="bg-red-800 px-4 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-red-700 disabled:opacity-50"
					>
						{exporting ? t('ui.exporting') : t('ui.export-png')}
					</button>
					<button
						onclick={() => showDropdown = !showDropdown}
						disabled={exporting}
						class="bg-red-800 border-l border-red-900 px-2 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
						aria-label={t('ui.more-export-options')}
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
							{t('ui.export-printer-friendly')}
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Sidebar body: two columns -->
		<div class="flex-1 overflow-y-auto p-5 flex gap-6">

			<!-- Left: Card Elements -->
			<div class="flex-1 min-w-0">
				<p class="field-label mb-3">{t('ui.form-card-elements')}</p>
				<div class="flex flex-col gap-1">
					{#each coreCats as cat}
						<label class="flex items-center gap-2 py-0.5 cursor-pointer text-sm text-zinc-300 hover:text-white">
							<input type="checkbox" class="accent-red-700" checked={checked.has(cat.id)} onchange={() => toggle(cat.id)} />
							{t('ui.form-show')} {t(cat.labelKey)}
						</label>
					{/each}
					{#each factionCats as cat}
						<label class="flex items-center gap-2 py-0.5 cursor-pointer text-sm text-zinc-300 hover:text-white">
							<input type="checkbox" class="accent-red-700" checked={checked.has(cat.id)} onchange={() => toggle(cat.id)} />
							{t('ui.form-show')} {cat.labelText}
						</label>
					{/each}
				</div>
			</div>

			<!-- Right: Card Design -->
			<div class="w-40 shrink-0">
				<p class="field-label mb-3">{t('ui.form-card-design')}</p>
				<label class="flex items-center gap-2 py-0.5 cursor-pointer text-sm text-zinc-300 hover:text-white">
					<input type="checkbox" class="accent-red-700" bind:checked={showCircle} />
					{t('ui.form-circle-type')}
				</label>
			</div>

		</div>
	</aside>

	<!-- RIGHT: Card preview -->
	<main
		class="flex flex-col flex-1 min-h-0 items-center justify-start overflow-y-auto pt-6 pb-6 lg:h-full"
		style:display={isMobile && activeTab !== 'preview' ? 'none' : 'flex'}
	>
		<!-- Mobile export button -->
		<div class="lg:hidden mb-4 flex items-center gap-3">
			<div class="relative">
				<div class="flex rounded-md overflow-hidden">
					<button
						onclick={exportCard}
						disabled={exporting}
						class="bg-red-800 px-4 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-red-700 disabled:opacity-50"
					>
						{exporting ? t('ui.exporting') : t('ui.export-png')}
					</button>
					<button
						onclick={() => showDropdown = !showDropdown}
						disabled={exporting}
						class="bg-red-800 border-l border-red-900 px-2 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
						aria-label={t('ui.more-export-options')}
					>
						<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>
					</button>
				</div>
				{#if showDropdown}
					<div class="absolute left-0 top-full mt-1 z-10 min-w-max rounded-md bg-zinc-800 border border-zinc-700 shadow-lg">
						<button
							onclick={exportPrinterFriendly}
							class="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 rounded-md"
						>
							{t('ui.export-printer-friendly')}
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- One scaled card per page -->
		{#each cardPages as page, i}
			<div style="width: {574 * cardScale}px; height: {915 * cardScale}px; position: relative; flex-shrink: 0; {i > 0 ? `margin-top: ${16 * cardScale}px;` : ''}">
				<div style="transform: scale({cardScale}); transform-origin: top left; position: absolute; top: 0; left: 0; display: inline-block; line-height: 0;">
					<div
						bind:this={cardEls[i]}
						style="width:574px;height:915px;overflow:hidden;position:relative;display:block;border:0;outline:none;{printerFriendly ? 'background:#fff;' : 'background:transparent;'}"
					>
						<!-- Parchment background -->
						{#if !printerFriendly}
							<img
								src="{base}/background.jpg"
								alt=""
								style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;display:block;border:0;outline:none;"
							/>
						{/if}

						<!-- Fixed 5×8 grid filling the full card area -->
						<div style="position:relative;z-index:1;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(8,1fr);gap:8px 6px;padding:20px;height:100%;box-sizing:border-box;border:0;outline:none;background:transparent;">
							{#each page as item}
								<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:0;min-width:0;border:0;outline:none;background:transparent;">
									<div class="rm-cell">
										{#if showCircle}
											{#if printerFriendly}
												<div class="rm-border-pf" style="position:absolute;inset:0;width:100%;height:100%;mask-image:{runemarkMaskUrl};-webkit-mask-image:{runemarkMaskUrl};">
													<div class="rm-badge rm-badge-pf" style="mask-image:{runemarkMaskUrl};-webkit-mask-image:{runemarkMaskUrl};">
														{@html item.svg}
													</div>
												</div>
											{:else}
												<div class="rm-badge" style="position:absolute;inset:0;width:100%;height:100%;mask-image:{runemarkMaskUrl};-webkit-mask-image:{runemarkMaskUrl};">
													{@html item.svg}
												</div>
											{/if}
										{:else}
											{@html item.svg}
										{/if}
									</div>
									<span style="font-family:'Alegreya';font-size:8.5px;text-transform:uppercase;text-align:center;line-height:1.3;color:#000;word-break:break-word;width:100%;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;flex-shrink:0;border:0;outline:none;background:transparent;">
										{item.label}
									</span>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</main>

</div>

{#if exportedImageUrl}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex flex-col bg-black/90"
		onclick={() => exportedImageUrl = null}
	>
		<div class="flex items-center justify-between px-5 py-4 shrink-0">
			<p class="text-sm font-semibold" style="color: #fff">{t('ui.long-press-save')}</p>
			<button class="text-sm font-semibold px-3 py-1 rounded-full" style="color: #fff; background: rgba(255,255,255,0.2)" onclick={() => exportedImageUrl = null}>{t('ui.close')}</button>
		</div>
		<div class="flex-1 min-h-0 overflow-y-auto flex justify-center px-4 pb-6">
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				src={exportedImageUrl}
				alt={t('ui.exported-card-alt')}
				class="w-full h-auto self-start rounded shadow-xl"
				style="max-width: 400px;"
				onclick={(e) => e.stopPropagation()}
			/>
		</div>
	</div>
{/if}
