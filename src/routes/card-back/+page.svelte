<svelte:head>
	<title>Card Back — Warcry Card Creator</title>
</svelte:head>

<script lang="ts">
	import { base } from '$app/paths';
	import type { CardBackData } from '$lib/types';
	import { fighterRunemarks, weaponRunemarks, characteristicRunemarks, hierarchy, cardDecksRunemarks, deploymentRunemarks, miscRunemarks, treasureRunemarks, twistsRunemarks } from '$lib/runemarks/index';
	import { t, i18n } from '$lib/i18n/index.svelte';

	let cardEl: HTMLElement;
	let exporting = $state(false);
	let exportedImageUrl = $state<string | null>(null);
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

	let data = $state<CardBackData>({
		title: '',
		backgroundImage: null,
		imageOffsetX: 50,
		imageOffsetY: 50,
		imageZoom: 1,
		runemark: '',
		textColor: 'white',
		showFlippedName: true,
	});

	const resolvedColor = $derived(
		printerFriendly ? '#000' :
		data.textColor === 'black' ? '#000' :
		data.textColor === 'red' ? '#c0392b' :
		'#fff'
	);

	const titleLines = $derived(data.title.split('|'));

	// Combined SVG lookup across all runemark categories
	const allRunemarkSvgs: Record<string, string> = (() => {
		const map: Record<string, string> = {
			...fighterRunemarks,
			...weaponRunemarks,
			...(characteristicRunemarks as Record<string, string>),
			...cardDecksRunemarks,
			...deploymentRunemarks,
			...miscRunemarks,
			...treasureRunemarks,
			...twistsRunemarks,
		};
		for (const alliance of hierarchy) {
			map[alliance.id] = alliance.svg;
			for (const faction of alliance.factions) {
				if (faction.svg) map[faction.id] = faction.svg;
				for (const sub of faction.subfactions) {
					if (sub.svg) map[sub.id] = sub.svg;
				}
			}
		}
		return map;
	})();

	let adjustMode = $state(false);

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
			data.imageOffsetY = Math.max(0, Math.min(100, touchState.startOffsetY - dy * (50 / 915)));
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

	let runemarkSearch = $state('');

	type RunemarkOpt = { id: string; label: string; group: string; groupLabel: string };

	const allRunemarkOptions = $derived((() => {
		const loc = i18n.code;
		const entries: RunemarkOpt[] = [];

		// Fighter runemarks — sorted by label
		const runemarkGroupLabel = t('ui.form-runemarks');
		Object.keys(fighterRunemarks)
			.map(key => ({ id: key, label: t('runemarks.' + key), group: 'runemarks', groupLabel: runemarkGroupLabel }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => entries.push(o));

		// Weapon runemarks — sorted by label
		const weaponGroupLabel = 'Weapons';
		Object.keys(weaponRunemarks)
			.map(key => ({ id: key, label: t('weapons.' + key).replace(/\|/g, ' '), group: 'weapons', groupLabel: weaponGroupLabel }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => entries.push(o));

		// Characteristic runemarks
		const charGroupLabel = 'Characteristics';
		Object.keys(characteristicRunemarks)
			.map(key => ({ id: key, label: t('card.col-' + key).replace(/\|/g, ' '), group: 'characteristics', groupLabel: charGroupLabel }))
			.forEach(o => entries.push(o));

		// Card deck runemarks
		const cardDecksGroupLabel = t('ui.card-decks-group');
		Object.keys(cardDecksRunemarks)
			.map(key => ({ id: key, label: t('card-decks.' + key), group: 'card-decks', groupLabel: cardDecksGroupLabel }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => entries.push(o));

		// Deployment runemarks
		const deploymentGroupLabel = t('ui.deployment-group');
		Object.keys(deploymentRunemarks)
			.map(key => ({ id: key, label: t('deployment.' + key), group: 'deployment', groupLabel: deploymentGroupLabel }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => entries.push(o));

		// Misc runemarks
		const miscGroupLabel = t('ui.misc-group');
		Object.keys(miscRunemarks)
			.map(key => ({ id: key, label: t('misc.' + key), group: 'misc', groupLabel: miscGroupLabel }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => entries.push(o));

		// Treasure runemarks
		const treasureGroupLabel = t('ui.treasure-group');
		Object.keys(treasureRunemarks)
			.map(key => ({ id: key, label: t('treasure.' + key), group: 'treasure', groupLabel: treasureGroupLabel }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => entries.push(o));

		// Twist runemarks
		const twistsGroupLabel = t('ui.twists-group');
		Object.keys(twistsRunemarks)
			.map(key => ({ id: key, label: t('twists.' + key), group: 'twists', groupLabel: twistsGroupLabel }))
			.sort((a, b) => a.label.localeCompare(b.label, loc))
			.forEach(o => entries.push(o));

		// Faction hierarchy
		for (const alliance of hierarchy) {
			const groupLabel = t('alliances.' + alliance.id);
			entries.push({ id: alliance.id, label: groupLabel, group: alliance.id, groupLabel });
			for (const faction of alliance.factions) {
				if (faction.svg) entries.push({ id: faction.id, label: t('factions.' + faction.id), group: alliance.id, groupLabel });
				for (const sub of faction.subfactions) {
					if (sub.svg) entries.push({ id: sub.id, label: t('subfactions.' + sub.id), group: alliance.id, groupLabel });
				}
			}
		}

		return entries;
	})());

	const filteredRunemarkGroups = $derived((() => {
		const lc = runemarkSearch.trim().toLowerCase();
		const filtered = lc
			? allRunemarkOptions.filter(o => o.label.toLowerCase().includes(lc) || o.groupLabel.toLowerCase().includes(lc))
			: allRunemarkOptions;

		const groups: { id: string; label: string; items: RunemarkOpt[] }[] = [];
		let currentGroup = '';
		for (const item of filtered) {
			if (item.group !== currentGroup) {
				currentGroup = item.group;
				groups.push({ id: item.group, label: item.groupLabel, items: [] });
			}
			groups[groups.length - 1].items.push(item);
		}
		return groups;
	})());

	const selectedRunemarkLabel = $derived(
		data.runemark ? (allRunemarkOptions.find(o => o.id === data.runemark)?.label ?? data.runemark) : ''
	);

	const isRealMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

	function handleImageUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			data.backgroundImage = ev.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	function makeSlug() {
		const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');
		const now = new Date();
		const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
		return `${toSlug(data.title || 'card-back')}_${ts}`;
	}

	async function doExport(suffix: string) {
		if (!cardEl || exporting) return;
		exporting = true;
		try {
			let dataUrl: string;
			if (isRealMobile) {
				const { domToPng } = await import('modern-screenshot');
				dataUrl = await domToPng(cardEl, { width: 574, height: 915, scale: 2 });
				if (navigator.share && navigator.canShare) {
					const blob = await (await fetch(dataUrl)).blob();
					const file = new File([blob], `${makeSlug()}${suffix}.png`, { type: 'image/png' });
					await navigator.share({ files: [file] });
				} else {
					exportedImageUrl = dataUrl;
				}
			} else {
				const domtoimage = (await import('dom-to-image-more')).default;
				dataUrl = await domtoimage.toPng(cardEl, { scale: 2 });
				const a = document.createElement('a');
				a.href = dataUrl;
				a.download = `${makeSlug()}${suffix}.png`;
				a.click();
			}
		} catch {
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
		>{t('ui.tab-edit')}</button>
		<button
			class="flex-1 py-4 text-sm font-bold tracking-widest uppercase transition {activeTab === 'preview' ? 'bg-red-800 text-white' : 'bg-zinc-950 text-zinc-500'}"
			onclick={() => activeTab = 'preview'}
		>{t('ui.tab-preview')}</button>
	</nav>

	<!-- LEFT: Form panel -->
	<aside
		class="flex flex-col border-zinc-800 w-full flex-1 min-h-0 lg:w-[480px] lg:flex-none lg:shrink-0 lg:border-r lg:h-full"
		style:display={isMobile && activeTab !== 'edit' ? 'none' : 'flex'}
	>
		<div class="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0">
			<div class="flex items-center gap-3">
				<a href="{base}/" class="text-zinc-500 transition hover:text-white" aria-label="Back">←</a>
				<h1 class="text-sm font-semibold tracking-widest text-zinc-200 uppercase">{t('ui.card-back')}</h1>
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
							{t('ui.export-printer-friendly')}
						</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-5">
			<div class="space-y-10 text-sm">
				<!-- Title -->
				<section>
					<label class="field-label" for="card-back-title">{t('ui.form-fighter')} <span class="normal-case font-normal text-zinc-500">{t('ui.form-line-break-hint')}</span></label>
					<input
						id="card-back-title"
						class="field-input"
						type="text"
						bind:value={data.title}
						placeholder={t('ui.form-placeholder-card-back')}
					/>
				</section>

				<!-- Card Elements -->
				<section>
					<p class="field-label mb-2">{t('ui.form-card-elements')}</p>
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="checkbox" bind:checked={data.showFlippedName} class="h-4 w-4 rounded accent-red-800" />
						<span class="text-zinc-200">{t('ui.form-show-flipped-name')}</span>
					</label>
				</section>

				<!-- Text Color -->
				<section>
					<span class="field-label">{t('ui.form-text-color')}</span>
					<div class="color-swatches">
						<button
							class="color-swatch swatch-white"
							class:is-selected={data.textColor === 'white'}
							onclick={() => data.textColor = 'white'}
							aria-label="White"
						></button>
						<button
							class="color-swatch swatch-black"
							class:is-selected={data.textColor === 'black'}
							onclick={() => data.textColor = 'black'}
							aria-label="Black"
						></button>
						<button
							class="color-swatch swatch-red"
							class:is-selected={data.textColor === 'red'}
							onclick={() => data.textColor = 'red'}
							aria-label="Red"
						></button>
					</div>
				</section>

				<!-- Runemark -->
				<section>
					<span class="field-label">{t('ui.form-runemark')}</span>
					{#if selectedRunemarkLabel}
						<div class="rm-selection-badge">
							<span class="rm-selection-text">{selectedRunemarkLabel}</span>
							<button class="rm-clear-btn" onclick={() => { data.runemark = ''; runemarkSearch = ''; }} aria-label="Clear">×</button>
						</div>
					{/if}
					<input
						class="rm-search-input"
						type="text"
						placeholder={t('ui.form-filter-runemarks')}
						bind:value={runemarkSearch}
					/>
					<div class="rm-list">
						{#each filteredRunemarkGroups as group}
							<div class="rm-group-header">{group.label}</div>
							{#each group.items as opt}
								<button
									class="rm-row"
									class:rm-row-selected={data.runemark === opt.id}
									onclick={() => data.runemark = opt.id}
								>{opt.label}</button>
							{/each}
						{/each}
						{#if filteredRunemarkGroups.length === 0}
							<p class="rm-empty">{t('ui.no-matches', { query: runemarkSearch })}</p>
						{/if}
					</div>
				</section>

				<!-- Background Image -->
				<section>
					<span class="field-label">{t('ui.form-background-image')}</span>
					{#if data.backgroundImage}
						<div class="flex items-center gap-3 mb-3">
							<img src={data.backgroundImage} alt="Preview" class="h-16 w-16 rounded object-cover" />
							<button
								class="text-xs text-zinc-400 underline hover:text-white"
								onclick={() => { data.backgroundImage = null; adjustMode = false; }}
							>
								{t('ui.form-remove')}
							</button>
						</div>
						<div class="hidden lg:block space-y-2">
							<div>
								<label class="sublabel" for="img-offset-x">{t('ui.form-position-x')} <span class="font-normal">({t('ui.form-position-x-hint')})</span></label>
								<input id="img-offset-x" type="range" min="0" max="100" bind:value={data.imageOffsetX} class="w-full accent-red-800" />
							</div>
							<div>
								<label class="sublabel" for="img-offset-y">{t('ui.form-position-y')} <span class="font-normal">({t('ui.form-position-y-hint')})</span></label>
								<input id="img-offset-y" type="range" min="0" max="100" bind:value={data.imageOffsetY} class="w-full accent-red-800" />
							</div>
							<div>
								<label class="sublabel" for="img-zoom">{t('ui.form-zoom')}</label>
								<input id="img-zoom" type="range" min="1" max="3" step="0.05" bind:value={data.imageZoom} class="w-full accent-red-800" />
							</div>
						</div>
						<p class="lg:hidden text-sm text-zinc-500">{t('ui.adjust-image-hint-mobile')}</p>
					{:else}
						<label
							class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-6 transition hover:border-zinc-500"
						>
							<span class="text-zinc-300">{t('ui.form-click-to-upload')}</span>
							<span class="mt-1 text-xs text-zinc-400">PNG, JPG, WebP</span>
							<input type="file" accept="image/*" class="sr-only" onchange={handleImageUpload} />
						</label>
					{/if}
				</section>
			</div>
		</div>
	</aside>

	<!-- RIGHT: Card preview -->
	<main
		class="flex flex-col flex-1 min-h-0 items-center justify-start overflow-y-auto pt-6 lg:justify-center lg:pt-0 lg:h-full lg:overflow-hidden"
		style:display={isMobile && activeTab !== 'preview' ? 'none' : 'flex'}
	>
		<!-- Export button + adjust toggle: mobile only -->
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
						aria-label="More export options"
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

			{#if data.backgroundImage}
				<button
					onclick={() => adjustMode = !adjustMode}
					class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition {adjustMode ? 'bg-red-800 text-white' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'}"
				>
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/>
						<polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/>
						<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
					</svg>
					{adjustMode ? t('ui.done') : t('ui.adjust-image')}
				</button>
			{/if}
		</div>

		<!-- Card wrapper -->
		<div style="width: {574 * cardScale}px; height: {915 * cardScale}px; position: relative; flex-shrink: 0;">
			<div style="transform: scale({cardScale}); transform-origin: top left; position: absolute; top: 0; left: 0; display: inline-block; line-height: 0;">
				<div bind:this={cardEl} style="display:inline-block; line-height:0; border:0; outline:none; background:transparent;">
					<div class="card" class:printer-friendly={printerFriendly} class:has-bg-image={!!data.backgroundImage} style="--card-text-color: {resolvedColor};">

						{#if data.backgroundImage && !printerFriendly}
							<img
								src={data.backgroundImage}
								alt=""
								style="position:absolute; inset:0; width:100%; height:100%; display:block; object-fit:cover; object-position:{data.imageOffsetX}% {data.imageOffsetY}%; transform:scale({data.imageZoom}); transform-origin:{data.imageOffsetX}% {data.imageOffsetY}%; border:0; outline:none; background:transparent;"
							/>
						{/if}
						<div class="name-overlay" class:name-overlay-text-only={data.title && data.showFlippedName && !(data.runemark && allRunemarkSvgs[data.runemark])}>
							{#if data.title}
								<p class="card-name">
									{#each titleLines as line, i}{#if i > 0}<br>{/if}{line}{/each}
								</p>
							{/if}
							{#if data.runemark && allRunemarkSvgs[data.runemark]}
								<div class="card-runemark">{@html allRunemarkSvgs[data.runemark]}</div>
							{/if}
							{#if data.title && data.showFlippedName}
								<p class="card-name card-name-flipped">
									{#each titleLines as line, i}{#if i > 0}<br>{/if}{line}{/each}
								</p>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Touch overlay for image positioning (mobile only) -->
			{#if adjustMode && data.backgroundImage}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; touch-action: none; cursor: grab;"
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
				alt="Exported card"
				class="w-full h-auto self-start rounded shadow-xl"
				style="max-width: 400px;"
				onclick={(e) => e.stopPropagation()}
			/>
		</div>
	</div>
{/if}

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

	/* ── Runemark search list ───────────────────── */

	.rm-selection-badge {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		background: var(--ui-sel-bg);
		border: 1px solid var(--ui-sel-border);
		border-radius: 6px;
		padding: 4px 6px 4px 10px;
		margin-bottom: 5px;
	}

	.rm-selection-text {
		font-size: 0.78rem;
		color: var(--ui-sel-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.rm-clear-btn {
		flex-shrink: 0;
		background: none;
		border: none;
		color: var(--ui-sel-text);
		font-size: 1.1rem;
		line-height: 1;
		padding: 0 2px;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.1s;
	}

	.rm-clear-btn:hover {
		opacity: 1;
	}

	.rm-search-input {
		width: 100%;
		box-sizing: border-box;
		background: var(--ui-surface);
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		padding: 6px 10px;
		color: var(--ui-text);
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.15s;
		margin-bottom: 5px;
	}

	.rm-search-input:focus {
		border-color: #7f1d1d;
	}

	.rm-list {
		max-height: 240px;
		overflow-y: auto;
		background: var(--ui-surface);
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		scrollbar-width: thin;
		scrollbar-color: var(--ui-border) transparent;
	}

	.rm-group-header {
		padding: 5px 10px 3px;
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ui-text-subtle);
		background: var(--ui-header-bg);
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.rm-row {
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		background: transparent;
		cursor: pointer;
		color: var(--ui-text-dim);
		padding: 5px 10px 5px 14px;
		font-size: 0.8rem;
		transition: background 0.1s, color 0.1s;
	}

	.rm-row:hover {
		background: var(--ui-surface-2);
		color: var(--ui-text);
	}

	.rm-row-selected {
		background: var(--ui-sel-row);
		color: var(--ui-sel-text);
	}

	.rm-empty {
		padding: 12px 14px;
		font-size: 0.8rem;
		color: var(--ui-text-subtle);
		font-style: italic;
	}

	/* ── Card back visual ───────────────────────── */

	.card {
		width: 574px;
		height: 915px;
		position: relative;
		overflow: hidden;
		background-color: #5a0a14;
		background-image: url('/background.jpg');
		background-size: cover;
		background-position: center;
		border: 0;
		outline: none;
	}

	.card * {
		border-width: 0;
		border-style: solid;
		outline: none;
		background: transparent;
	}

	.printer-friendly {
		background-image: none;
		background-color: #fff;
	}

	.has-bg-image {
		background-image: none;
	}

	.name-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 56px;
		padding: 2rem;
		border: 0;
		outline: none;
		background: transparent;
	}

	.name-overlay-text-only {
		gap: 220px;
	}

	.card-name {
		width: 100%;
		font-family: 'Germania One', serif;
		font-size: 56px;
		font-weight: 400;
		line-height: 1.1;
		color: var(--card-text-color, #fff);
		text-align: center;
		text-transform: uppercase;
		word-break: break-word;
		margin: 0;
		border: 0;
		outline: none;
		background: transparent;
	}

	.card-name-flipped {
		transform: rotate(180deg);
	}

	.card-runemark {
		width: 280px;
		height: 280px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		outline: none;
		background: transparent;
	}

	.card-runemark :global(svg) {
		width: 280px;
		height: 280px;
		fill: var(--card-text-color, #fff);
		border: 0;
		outline: none;
		background: transparent;
	}

	.card-runemark :global(svg *) {
		border: 0;
		outline: none;
	}

	.color-swatches {
		display: flex;
		gap: 10px;
		margin-top: 4px;
	}

	.color-swatch {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2px solid transparent;
		cursor: pointer;
		transition: border-color 0.15s;
		padding: 0;
	}

	.color-swatch.is-selected {
		border-color: #ef4444;
	}

	.swatch-white {
		background: #ffffff;
	}

	.swatch-black {
		background: #111111;
	}

	.swatch-red {
		background: #c0392b;
	}
</style>
