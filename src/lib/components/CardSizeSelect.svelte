<script lang="ts">
	import { CARD_SIZES, cardSize, EXPORT_SCALE, type CardSize, type Dimensions } from '$lib/card-size.svelte';
	import { t } from '$lib/i18n/index.svelte';

	/* Which layout the host editor renders, so the info line quotes the
	   dimensions the export will actually produce. */
	let { layout = 'portrait' }: { layout?: 'portrait' | 'classic' | 'landscape' } = $props();

	const sizes = Object.keys(CARD_SIZES) as CardSize[];

	const px = (d: Dimensions) => `${d.w * EXPORT_SCALE} × ${d.h * EXPORT_SCALE}`;

	/* The host dropdowns close on any document click, so keep the click here
	   from bubbling — otherwise the menu shuts before the info line updates. */
	function select(event: MouseEvent, size: CardSize) {
		event.stopPropagation();
		cardSize.set(size);
	}
</script>

<div class="px-4 py-2">
	<div class="mb-1.5 text-xs font-semibold tracking-wide text-zinc-400 uppercase">{t('ui.card-size')}</div>
	<div class="flex rounded-md overflow-hidden border border-zinc-600">
		{#each sizes as size}
			<button
				onclick={(e) => select(e, size)}
				aria-pressed={cardSize.current === size}
				class="flex-1 px-3 py-1.5 text-sm font-semibold transition {cardSize.current === size ? 'bg-red-800 text-white' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-700'}"
			>
				{t(CARD_SIZES[size].labelKey)}
			</button>
		{/each}
	</div>
	<div class="mt-1.5 text-xs text-zinc-400 tabular-nums">
		{t('ui.card-size-info', { mm: cardSize.spec.mmLabel, px: px(cardSize.spec[layout]) })}
	</div>
</div>
