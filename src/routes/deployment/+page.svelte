<svelte:head>
	<title>Deployment Card — Warcry Card Creator</title>
</svelte:head>

<script lang="ts">
	import { base } from '$app/paths';
	import DeploymentCard from '$lib/components/DeploymentCard.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import type {
		DeploymentCardData,
		DeploymentColor,
		DeploymentIconType,
		DeploymentObjective,
		DeploymentPosition,
	} from '$lib/types';

	type PopoverMode =
		| { kind: 'empty'; pos: DeploymentPosition }
		| { kind: 'occupied'; pos: DeploymentPosition; pi: number; pti: number }
		| { kind: 'measurement'; mi: number }
		| { kind: 'objective'; oi: number };

	// Card dimensions (landscape)
	const CARD_W = 915;
	const CARD_H = 574;

	let cardEl: HTMLElement;
	let exporting = $state(false);
	let exportedImageUrl = $state<string | null>(null);
	let printerFriendly = $state(false);
	let showDropdown = $state(false);
	let showJsonDropdown = $state(false);
	let jsonDropdownLeft = $state(0);
	let jsonBtnEl: HTMLElement;
	let showViewDropdown = $state(false);
	let viewDropdownLeft = $state(0);
	let viewBtnEl: HTMLElement;
	let showMarkers = $state(true);
	let showMatchedPlay = $state(true);
	let showOrientation = $state(true);
	let showRunemarks = $state(true);
	let measurementMode = $state(false);
	let measurementStart = $state<DeploymentPosition | undefined>(undefined);
	let activePlayerIndex = $state(0);
	let popover = $state<{ mode: PopoverMode; x: number; y: number } | null>(null);
	let popoverIcon = $state<DeploymentIconType>('dagger');
	let popoverObjectiveLabel = $state('');
	let popoverRnd = $state('');
	let popoverEl = $state<HTMLElement | undefined>(undefined);

	$effect(() => {
		if (!popover || !popoverEl) return;
		const el = popoverEl;
		const pv = popover;
		requestAnimationFrame(() => {
			const rect = el.getBoundingClientRect();
			const overflowBottom = rect.bottom - (viewportHeight - 8);
			if (overflowBottom > 0) {
				el.style.top = `${Math.max(8, pv.y - overflowBottom)}px`;
			}
			const overflowRight = rect.right - (viewportWidth - 8);
			if (overflowRight > 0) {
				el.style.left = `${Math.max(8, pv.x - overflowRight)}px`;
			}
		});
	});

	// Pinch-zoom state
	let userScale = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let _pinchDist0 = 0;
	let _pinchScale0 = 1;
	let _pinchPanX0 = 0;
	let _pinchPanY0 = 0;
	let _pinchCX0 = 0;
	let _pinchCY0 = 0;
	let _lastTap = 0;

	function onTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			const [t1, t2] = [e.touches[0], e.touches[1]];
			_pinchDist0 = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
			_pinchScale0 = userScale;
			_pinchPanX0 = panX;
			_pinchPanY0 = panY;
			_pinchCX0 = (t1.clientX + t2.clientX) / 2;
			_pinchCY0 = (t1.clientY + t2.clientY) / 2;
		}
	}

	function onTouchMove(e: TouchEvent) {
		if (e.touches.length !== 2) return;
		const [t1, t2] = [e.touches[0], e.touches[1]];
		const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
		const cx = (t1.clientX + t2.clientX) / 2;
		const cy = (t1.clientY + t2.clientY) / 2;
		userScale = Math.max(0.5, Math.min(4, _pinchScale0 * (dist / _pinchDist0)));
		panX = _pinchPanX0 + (cx - _pinchCX0);
		panY = _pinchPanY0 + (cy - _pinchCY0);
	}

	function onTouchEnd(e: TouchEvent) {
		if (e.touches.length === 0 && e.changedTouches.length === 1) {
			const now = Date.now();
			if (now - _lastTap < 300) {
				userScale = 1;
				panX = 0;
				panY = 0;
			}
			_lastTap = now;
		}
	}

	const isRealMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	let viewportHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 900);
	let viewportWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);

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

	$effect(() => {
		if (!showViewDropdown) return;
		const close = () => { showViewDropdown = false; };
		const id = setTimeout(() => document.addEventListener('click', close), 0);
		return () => { clearTimeout(id); document.removeEventListener('click', close); };
	});

	// Header 61px: py-3 (12) + h-9 (36) + py-3 (12) + border-b (1)
	const HEADER_H = 61;
	const cardScale = $derived(
		Math.min(
			1,
			(viewportWidth - 32) / CARD_W,
			(viewportHeight - HEADER_H - 32) / CARD_H
		)
	);

	let data = $state<DeploymentCardData>({
		name: '',
		players: [],
		measurements: [],
		objectives: [],
	});

	const COLORS: Record<DeploymentColor, string> = {
		red:    '#c0272d',
		blue:   '#2563eb',
		green:  '#16a34a',
		yellow: '#f59e0b',
	};
	const COLOR_ORDER: DeploymentColor[] = ['red', 'blue', 'green', 'yellow'];
	const ICONS: DeploymentIconType[] = ['dagger', 'hammer', 'shield'];
	function nextColor(): DeploymentColor {
		const used = new Set(data.players.map(p => p.color));
		return COLOR_ORDER.find(c => !used.has(c)) ?? 'red';
	}

	function addPlayer() {
		if (data.players.length >= 4) return;
		data.players = [...data.players, { color: nextColor(), zones: [], points: [] }];
		activePlayerIndex = data.players.length - 1;
	}

	function removePlayer(pi: number) {
		data.players = data.players.filter((_, i) => i !== pi);
		activePlayerIndex = Math.min(activePlayerIndex, Math.max(0, data.players.length - 1));
	}

	function findPoint(pos: DeploymentPosition): { pi: number; pti: number } | null {
		for (let pi = 0; pi < data.players.length; pi++) {
			const pti = data.players[pi].points.findIndex(p => p.position === pos);
			if (pti !== -1) return { pi, pti };
		}
		return null;
	}

	function clampedStyle(x: number, y: number): string {
		const cx = Math.max(8, Math.min(x, viewportWidth - 240));
		const cy = Math.max(8, Math.min(y, viewportHeight - 500));
		return `left:${cx}px; top:${cy}px;`;
	}

	function closePopover() { popover = null; }

	function handlePositionClick(pos: DeploymentPosition, clientX: number, clientY: number) {
		if (measurementMode) {
			if (measurementStart && pos !== measurementStart) {
				data.measurements = [...data.measurements, {
					startPos: measurementStart,
					endPos: pos,
					label: '',
					startCap: 'dot',
					endCap: 'arrow',
				}];
			}
			measurementMode = false;
			measurementStart = undefined;
			return;
		}
		const oi = (data.objectives ?? []).findIndex((o: DeploymentObjective) => o.position === pos);
		if (oi !== -1) {
			popover = { mode: { kind: 'objective', oi }, x: clientX, y: clientY };
			return;
		}
		const found = findPoint(pos);
		if (found) {
			popover = { mode: { kind: 'occupied', pos, ...found }, x: clientX, y: clientY };
		} else {
			popoverIcon = 'dagger';
			popoverObjectiveLabel = '';
			popoverRnd = '';
			popover = { mode: { kind: 'empty', pos }, x: clientX, y: clientY };
		}
	}

	function handleMeasurementClick(mi: number, clientX: number, clientY: number) {
		popover = { mode: { kind: 'measurement', mi }, x: clientX, y: clientY };
	}

	function confirmAddPoint() {
		if (!popover || popover.mode.kind !== 'empty') return;
		const pos = popover.mode.pos;
		if (data.players.length === 0) {
			data.players = [{ color: 'red', zones: [], points: [] }];
			activePlayerIndex = 0;
		}
		const pi = Math.min(activePlayerIndex, data.players.length - 1);
		data.players[pi].points = [...data.players[pi].points, { position: pos, icon: popoverIcon, rnd: popoverRnd }];
		data.players = [...data.players];
		closePopover();
	}

	function confirmAddMeasurement() {
		if (!popover || popover.mode.kind !== 'empty') return;
		measurementStart = popover.mode.pos;
		measurementMode = true;
		closePopover();
	}

	function confirmAddObjective() {
		if (!popover || popover.mode.kind !== 'empty') return;
		data.objectives = [...(data.objectives ?? []), { position: popover.mode.pos, label: popoverObjectiveLabel }];
		closePopover();
	}

	function removeObjectiveFromPopover() {
		if (!popover || popover.mode.kind !== 'objective') return;
		const { oi } = popover.mode;
		data.objectives = (data.objectives ?? []).filter((_, i) => i !== oi);
		closePopover();
	}

	function removeOccupiedPoint() {
		if (!popover || popover.mode.kind !== 'occupied') return;
		const { pi, pti } = popover.mode;
		data.players[pi].points = data.players[pi].points.filter((_, i) => i !== pti);
		data.players = [...data.players];
		closePopover();
	}

	function setOccupiedIcon(icon: DeploymentIconType) {
		if (!popover || popover.mode.kind !== 'occupied') return;
		const { pi, pti } = popover.mode;
		data.players[pi].points[pti] = { ...data.players[pi].points[pti], icon };
		data.players = [...data.players];
	}

	function reassignPointToColor(color: DeploymentColor) {
		if (!popover || popover.mode.kind !== 'occupied') return;
		const { pi, pti } = popover.mode;
		if (data.players[pi].color === color) return;
		const point = data.players[pi].points[pti];
		// Find or create the target player
		let newPi = data.players.findIndex(p => p.color === color);
		if (newPi === -1) {
			data.players = [...data.players, { color, zones: [], points: [] }];
			newPi = data.players.length - 1;
		}
		data.players[pi].points = data.players[pi].points.filter((_, i) => i !== pti);
		data.players[newPi].points = [...data.players[newPi].points, point];
		data.players = [...data.players];
		popover = { ...popover, mode: { kind: 'occupied', pos: popover.mode.pos, pi: newPi, pti: data.players[newPi].points.length - 1 } };
	}

	function removeMeasurementFromPopover() {
		if (!popover || popover.mode.kind !== 'measurement') return;
		removeMeasurement(popover.mode.mi);
		closePopover();
	}

	function removeMeasurement(mi: number) {
		data.measurements = data.measurements.filter((_, i) => i !== mi);
	}

	function addZone(pi: number) {
		data.players[pi].zones = [...(data.players[pi].zones ?? []), { preset: 'top-half' }];
		data.players = [...data.players];
	}

	function removeZone(pi: number, zi: number) {
		data.players[pi].zones = data.players[pi].zones.filter((_, i) => i !== zi);
		data.players = [...data.players];
	}

	function makeSlug() {
		const name = data.name.toLowerCase().replace(/\s+/g, '-') || 'deployment-card';
		const now = new Date();
		const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
		return `${name}_${ts}`;
	}

	async function doExport(suffix: string) {
		if (!cardEl || exporting) return;
		exporting = true;
		try {
			let dataUrl: string;
			if (isRealMobile) {
				const { domToPng } = await import('modern-screenshot');
				dataUrl = await domToPng(cardEl, { width: CARD_W, height: CARD_H, scale: 2 });
				if (navigator.share && navigator.canShare) {
					const blob = await (await fetch(dataUrl)).blob();
					const file = new File([blob], `${makeSlug()}${suffix}.png`, { type: 'image/png' });
					await navigator.share({ files: [file] });
				} else {
					exportedImageUrl = dataUrl;
				}
			} else {
				const domtoimage = (await import('dom-to-image-more')).default;
				dataUrl = await domtoimage.toPng(cardEl, { width: CARD_W, height: CARD_H, scale: 2 });
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

	function saveLayout() {
		showJsonDropdown = false;
		const json = JSON.stringify(data, null, 2);
		const a = document.createElement('a');
		a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
		a.download = `${makeSlug()}.json`;
		a.click();
		URL.revokeObjectURL(a.href);
	}

	let fileInput: HTMLInputElement;

	function loadLayout() {
		showJsonDropdown = false;
		fileInput.click();
	}

	function handleFileLoad(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			try {
				data = JSON.parse(ev.target?.result as string);
			} catch { /* ignore malformed JSON */ }
		};
		reader.readAsText(file);
		(e.target as HTMLInputElement).value = '';
	}
</script>

<div class="relative flex flex-col h-dvh bg-zinc-900 text-white overflow-hidden">
	<div class="wip-watermark" aria-hidden="true"></div>

	<!-- Header toolbar — single scrollable row; dropdowns use position:fixed to escape overflow clipping -->
	<header class="flex items-center gap-3 border-b border-zinc-800 shrink-0 overflow-x-auto px-4 py-3">

		<a href="{base}/" class="flex items-center h-9 px-3 rounded text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition shrink-0">{t('ui.back')}</a>

		<div class="w-px h-7 bg-zinc-700 shrink-0"></div>

		<!-- Card name (grows to fill available space) -->
		<input
			type="text"
			bind:value={data.name}
			placeholder={t('ui.form-placeholder-deployment')}
			class="h-9 flex-1 min-w-32 rounded bg-zinc-800 border border-zinc-700 px-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-700"
		/>

		<div class="w-px h-7 bg-zinc-700 shrink-0"></div>

		<!-- Players: click circle to make active, button removes the active player -->
		<div class="flex items-center gap-2 shrink-0">
			{#each data.players as player, pi}
				{@const col = COLORS[player.color]}
				<button
					onclick={() => activePlayerIndex = pi}
					style="background: {col}; outline-color: {pi === activePlayerIndex ? col : 'transparent'}"
					class="w-9 h-9 rounded-full outline outline-2 outline-offset-2 transition-[outline-color]"
					title={t('ui.select-player-title', { color: t('ui.color-' + player.color) })}
				></button>
			{/each}
			{#if data.players.length > 0}
				<button
					onclick={() => removePlayer(activePlayerIndex)}
					class="h-9 rounded px-3 text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-red-900 hover:text-red-300 transition"
					title={t('ui.remove-player-title')}
				>✕ {t('ui.color-' + data.players[activePlayerIndex]?.color)}</button>
			{/if}
		</div>

		<div class="w-px h-7 bg-zinc-700 shrink-0"></div>

		<!-- View dropdown — Show Markers + Show Runemarks toggles -->
		<div class="relative shrink-0" bind:this={viewBtnEl}>
			<button
				onclick={() => { showDropdown = false; showJsonDropdown = false; if (!showViewDropdown) viewDropdownLeft = viewBtnEl.getBoundingClientRect().left; showViewDropdown = !showViewDropdown; }}
				class="flex items-center gap-1.5 h-9 px-3 rounded text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition"
			>
				{t('ui.view')}
				<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>
			</button>
			{#if showViewDropdown}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="fixed z-30 rounded-md bg-zinc-800 border border-zinc-700 shadow-lg p-3 flex flex-col gap-3"
					style="top: 52px; left: {viewDropdownLeft}px; min-width: 13rem;"
					onclick={(e) => e.stopPropagation()}
				>
					<label class="flex items-center justify-between gap-6 cursor-pointer select-none">
						<span class="text-sm font-semibold text-zinc-300">{t('ui.overlays')}</span>
						<button
							role="switch"
							aria-checked={showMarkers}
							onclick={() => showMarkers = !showMarkers}
							class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors {showMarkers ? 'bg-red-700' : 'bg-zinc-600'}"
						>
							<span class="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform {showMarkers ? 'translate-x-[22px]' : 'translate-x-[3px]'}"></span>
						</button>
					</label>
					<label class="flex items-center justify-between gap-6 cursor-pointer select-none">
						<span class="text-sm font-semibold text-zinc-300">{t('ui.form-show-runemarks')}</span>
						<button
							role="switch"
							aria-checked={showRunemarks}
							onclick={() => showRunemarks = !showRunemarks}
							class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors {showRunemarks ? 'bg-red-700' : 'bg-zinc-600'}"
						>
							<span class="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform {showRunemarks ? 'translate-x-[22px]' : 'translate-x-[3px]'}"></span>
						</button>
					</label>
					<label class="flex items-center justify-between gap-6 cursor-pointer select-none">
						<span class="text-sm font-semibold text-zinc-300">{t('ui.form-show-orientation')}</span>
						<button
							role="switch"
							aria-checked={showOrientation}
							onclick={() => showOrientation = !showOrientation}
							class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors {showOrientation ? 'bg-red-700' : 'bg-zinc-600'}"
						>
							<span class="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform {showOrientation ? 'translate-x-[22px]' : 'translate-x-[3px]'}"></span>
						</button>
					</label>
					<label class="flex items-center justify-between gap-6 cursor-pointer select-none">
						<span class="text-sm font-semibold text-zinc-300">{t('ui.form-show-matched-play')}</span>
						<button
							role="switch"
							aria-checked={showMatchedPlay}
							onclick={() => showMatchedPlay = !showMatchedPlay}
							class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors {showMatchedPlay ? 'bg-red-700' : 'bg-zinc-600'}"
						>
							<span class="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform {showMatchedPlay ? 'translate-x-[22px]' : 'translate-x-[3px]'}"></span>
						</button>
					</label>
				</div>
			{/if}
		</div>

		<div class="w-px h-7 bg-zinc-700 shrink-0"></div>

		<!-- Save / Load JSON — dropdown uses position:fixed to escape overflow-x-auto clipping -->
		<div class="relative shrink-0" bind:this={jsonBtnEl}>
			<div class="flex h-9 rounded-md overflow-hidden">
				<button
					onclick={saveLayout}
					class="flex items-center px-3 text-sm font-semibold bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition"
				>{t('ui.save-json')}</button>
				<button
					onclick={() => { showDropdown = false; showViewDropdown = false; if (!showJsonDropdown) jsonDropdownLeft = jsonBtnEl.getBoundingClientRect().left; showJsonDropdown = !showJsonDropdown; }}
					class="flex items-center px-2 bg-zinc-700 border-l border-zinc-600 text-zinc-200 hover:bg-zinc-600 transition"
					aria-label={t('ui.more-json-options')}
				>
					<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>
				</button>
			</div>
			{#if showJsonDropdown}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="fixed z-30 min-w-max rounded-md bg-zinc-800 border border-zinc-700 shadow-lg overflow-hidden"
					style="top: 52px; left: {jsonDropdownLeft}px"
					onmouseleave={() => showJsonDropdown = false}
				>
					<button onclick={loadLayout} class="w-full text-left px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700">{t('ui.load-json')}</button>
				</div>
			{/if}
		</div>

		<!-- Export PNG — dropdown uses position:fixed to escape overflow-x-auto clipping -->
		<div class="relative shrink-0">
			<div class="flex h-9 rounded-md overflow-hidden">
				<button
					onclick={exportCard}
					disabled={exporting}
					class="flex items-center px-3 text-sm font-semibold bg-red-800 text-white hover:bg-red-700 disabled:opacity-50 transition"
				>{exporting ? t('ui.exporting') : t('ui.export-png')}</button>
				<button
					onclick={() => { showJsonDropdown = false; showViewDropdown = false; showDropdown = !showDropdown; }}
					disabled={exporting}
					class="flex items-center px-2 bg-red-800 border-l border-red-900 text-white hover:bg-red-700 disabled:opacity-50 transition"
					aria-label={t('ui.more-export-options')}
				>
					<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>
				</button>
			</div>
			{#if showDropdown}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="fixed right-4 z-30 min-w-max rounded-md bg-zinc-800 border border-zinc-700 shadow-lg overflow-hidden"
					style="top: 52px"
					onmouseleave={() => showDropdown = false}
				>
					<button onclick={exportPrinterFriendly} class="w-full text-left px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700">{t('ui.export-printer-friendly')}</button>
				</div>
			{/if}
		</div>

	</header>

	<!-- Measurement hint bar -->
	{#if measurementMode}
		<div class="shrink-0 bg-zinc-800 border-b border-zinc-700 px-4 py-2 flex items-center justify-between gap-4">
			<span class="text-xs text-zinc-400">{t('ui.measurement-pick-end')}</span>
			<button
				onclick={() => { measurementMode = false; measurementStart = undefined; }}
				class="text-xs text-zinc-400 hover:text-white transition"
			>{t('ui.measurement-cancel')}</button>
		</div>
	{/if}

	<!-- Card area -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<main
		class="flex flex-1 items-center justify-center overflow-hidden"
		style="touch-action: none;"
		ontouchstart={onTouchStart}
		ontouchmove={onTouchMove}
		ontouchend={onTouchEnd}
	>
		<div style="transform: translate({panX}px, {panY}px) scale({cardScale * userScale}); transform-origin: center; display: inline-block; line-height: 0; flex-shrink: 0;">
			<div bind:this={cardEl} style="display:inline-block; line-height:0; border:0; outline:none; background:transparent;">
				<DeploymentCard
					{data}
					{printerFriendly}
					{showMatchedPlay}
					{showOrientation}
					{showRunemarks}
					showPositionDots={showMarkers && !exporting}
					measurementStartPos={measurementMode ? measurementStart : undefined}
					onPositionClick={exporting ? undefined : handlePositionClick}
					onMeasurementClick={showMarkers && !exporting && !measurementMode ? handleMeasurementClick : undefined}
				/>
			</div>
		</div>
	</main>


</div>

<!-- Hidden file input for JSON load -->
<input bind:this={fileInput} type="file" accept=".json,application/json" class="hidden" onchange={handleFileLoad} />

<!-- Popover backdrop + panel -->
{#if popover}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-40" onclick={closePopover}></div>

	<div bind:this={popoverEl} class="popover fixed z-50 w-56 rounded-xl bg-zinc-800 border border-zinc-700 shadow-2xl p-3 flex flex-col gap-3 overflow-y-auto" style="{clampedStyle(popover.x, popover.y)} max-height: calc(100dvh - 16px);">

		<!-- Empty dot -->
		{#if popover.mode.kind === 'empty'}
			<div class="popover-title">{t('ui.popover-add-to-position')}</div>

			<!-- Player colour row -->
			<div>
				<div class="popover-label">{t('ui.form-players')}</div>
				<div class="flex gap-1.5 flex-wrap">
					{#each data.players as player, pi}
						<button
							onclick={() => activePlayerIndex = pi}
							style="background:{COLORS[player.color]}; outline-color:{activePlayerIndex === pi ? COLORS[player.color] : 'transparent'}"
							class="w-7 h-7 rounded-full outline outline-2 outline-offset-1 transition-[outline-color]"
						></button>
					{/each}
					{#if data.players.length === 0}
						<span class="text-xs text-zinc-500">{t('ui.popover-no-players-hint')}</span>
					{/if}
				</div>
			</div>

			<!-- Icon row -->
			<div>
				<div class="popover-label">{t('ui.form-icon')}</div>
				<div class="flex gap-1">
					{#each ICONS as icon}
						<button
							onclick={() => popoverIcon = icon}
							class="flex-1 h-7 rounded text-xs font-semibold transition {popoverIcon === icon ? 'bg-red-800 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}"
						>{t('deployment.' + icon)}</button>
					{/each}
				</div>
			</div>

			<!-- RND -->
			<input type="text" bind:value={popoverRnd} placeholder={t('ui.form-round-placeholder')} class="popover-input" />

			<!-- Point + measurement actions -->
			<button onclick={confirmAddPoint} class="w-full rounded bg-red-800 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition">{t('ui.popover-add-point')}</button>
			<button onclick={confirmAddMeasurement} class="w-full rounded bg-zinc-700 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-600 transition">{t('ui.popover-measurement')}</button>

			<!-- Objective section -->
			<div class="border-t border-zinc-700 pt-3 flex flex-col gap-2">
				<div class="popover-label">{t('deployment.objective')}</div>
				<input type="text" bind:value={popoverObjectiveLabel} placeholder={t('ui.form-objective-label')} class="popover-input" />
				<button onclick={confirmAddObjective} class="w-full rounded bg-zinc-700 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-600 transition">{t('ui.popover-add-objective')}</button>
			</div>

		<!-- Occupied dot -->
		{:else if popover.mode.kind === 'occupied'}
			{@const { pi, pti } = popover.mode}
			{@const point = data.players[pi]?.points[pti]}
			{@const playerColor = COLORS[data.players[pi]?.color]}
			{#if point}
				<div class="popover-title" style="color:{playerColor}">{t('ui.color-' + data.players[pi].color)}</div>

				<!-- Reassign colour -->
				<div>
					<div class="popover-label">{t('ui.form-players')}</div>
					<div class="flex gap-1.5">
						{#each COLOR_ORDER as color}
							{@const isActive = data.players[pi].color === color}
							<button
								onclick={() => reassignPointToColor(color)}
								style="background:{COLORS[color]}; outline-color:{isActive ? COLORS[color] : 'transparent'}"
								class="w-7 h-7 rounded-full outline outline-2 outline-offset-1 transition-[outline-color]"
								title={t('ui.color-' + color)}
							></button>
						{/each}
					</div>
				</div>

				<!-- Icon row -->
				<div>
					<div class="popover-label">{t('ui.form-icon')}</div>
					<div class="flex gap-1">
						{#each ICONS as icon}
							<button
								onclick={() => setOccupiedIcon(icon)}
								class="flex-1 h-7 rounded text-xs font-semibold transition {point.icon === icon ? 'bg-red-800 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}"
							>{t('deployment.' + icon)}</button>
						{/each}
					</div>
				</div>

				<!-- RND -->
				<div>
					<div class="popover-label">{t('ui.form-round-label')}</div>
					<input
						type="text"
						value={point.rnd}
						oninput={(e) => { data.players[pi].points[pti] = { ...point, rnd: (e.target as HTMLInputElement).value }; data.players = [...data.players]; }}
						placeholder={t('ui.form-round-placeholder')}
						class="popover-input"
					/>
				</div>

				<button onclick={removeOccupiedPoint} class="text-xs text-zinc-400 underline hover:text-white transition">{t('ui.popover-remove-point')}</button>
			{/if}

		<!-- Measurement -->
		{:else if popover.mode.kind === 'measurement'}
			{@const m = data.measurements[popover.mode.mi]}
			{@const mi = popover.mode.mi}
			{#if m}
				<div class="popover-title">{t('ui.popover-measurement-n', { n: String(mi + 1) })}</div>

				<!-- Start cap -->
				<div>
					<div class="popover-label">{t('ui.form-measurement-start-cap')}</div>
					<div class="cap-row">
						{#each (['dot', 'arrow', 'tick', 'none'] as const) as cap}
							<button
								onclick={() => { data.measurements[mi] = { ...m, startCap: cap }; data.measurements = [...data.measurements]; }}
								class="cap-cell {m.startCap === cap ? 'cap-cell--active' : ''}"
							>{ cap === 'dot' ? '●' : cap === 'arrow' ? '←' : cap === 'tick' ? '⊤' : '—' }</button>
						{/each}
					</div>
				</div>

				<!-- End cap -->
				<div>
					<div class="popover-label">{t('ui.form-measurement-end-cap')}</div>
					<div class="cap-row">
						{#each (['dot', 'arrow', 'tick', 'none'] as const) as cap}
							<button
								onclick={() => { data.measurements[mi] = { ...m, endCap: cap }; data.measurements = [...data.measurements]; }}
								class="cap-cell {m.endCap === cap ? 'cap-cell--active' : ''}"
							>{ cap === 'dot' ? '●' : cap === 'arrow' ? '→' : cap === 'tick' ? '⊥' : '—' }</button>
						{/each}
					</div>
				</div>

				<!-- Label -->
				<div>
					<div class="popover-label">{t('ui.form-measurement-label')}</div>
					<input
						type="text"
						value={m.label}
						oninput={(e) => { data.measurements[mi] = { ...m, label: (e.target as HTMLInputElement).value }; data.measurements = [...data.measurements]; }}
						placeholder={t('ui.form-measurement-label')}
						class="popover-input"
					/>
				</div>

				<button onclick={removeMeasurementFromPopover} class="text-xs text-zinc-400 underline hover:text-white transition">{t('ui.form-remove')}</button>
			{/if}

		<!-- Objective -->
		{:else if popover.mode.kind === 'objective'}
			{@const obj = (data.objectives ?? [])[popover.mode.oi]}
			{@const oi = popover.mode.oi}
			{#if obj}
				<div class="popover-title">{t('deployment.objective')}</div>

				<div>
					<div class="popover-label">{t('ui.form-objective-label')}</div>
					<input
						type="text"
						value={obj.label}
						oninput={(e) => { const arr = [...(data.objectives ?? [])]; arr[oi] = { ...obj, label: (e.target as HTMLInputElement).value }; data.objectives = arr; }}
						placeholder={t('ui.form-objective-label')}
						class="popover-input"
					/>
				</div>

				<button onclick={removeObjectiveFromPopover} class="text-xs text-zinc-400 underline hover:text-white transition">{t('ui.popover-remove-objective')}</button>
			{/if}
		{/if}

	</div>
{/if}

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
				style="max-width: 600px;"
				onclick={(e) => e.stopPropagation()}
			/>
		</div>
	</div>
{/if}

<style>
	.popover-title {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ui-text, #fff);
	}

	.popover-label {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ui-field-label, #888);
		margin-bottom: 0.25rem;
	}

	.popover-input {
		width: 100%;
		box-sizing: border-box;
		appearance: none;
		background: var(--ui-surface);
		border: 1px solid var(--ui-border);
		border-radius: 6px;
		padding: 5px 8px;
		color: var(--ui-text);
		font-size: 0.85rem;
		outline: none;
	}

	.popover-input:focus { border-color: #7f1d1d; }

	.cap-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 3px;
	}

	.cap-cell {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		border-radius: 5px;
		background: var(--ui-surface-2);
		color: var(--ui-text-dim);
		cursor: pointer;
		transition: background 0.1s;
	}

	.cap-cell:hover { background: var(--ui-surface-hover); }

	.cap-cell--active {
		background: #991b1b;
		color: #fff;
	}

</style>
