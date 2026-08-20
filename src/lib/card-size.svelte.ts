export type CardSize = 'bridge' | 'poker';

export interface Dimensions {
	w: number;
	h: number;
}

export interface CardSizeSpec {
	labelKey: string;
	/** Printed size as the trade quotes it. Exact values are 57.15×88.9mm
	    (bridge) and 63.5×88.9mm (poker); print services list the rounded pair. */
	mmLabel: string;
	/** Fighter, text, card back and reference cards. */
	portrait: Dimensions;
	/** Classic-format fighter card. */
	classic: Dimensions;
	/** Deployment card. */
	landscape: Dimensions;
}

/* Portrait holds its 915px height and varies width, because the parchment
   column is vertically tight. Classic holds its 1167px width and varies
   height, because the parchment column is pinned at 576px and shrinking it
   would squeeze the model image. */
export const CARD_SIZES: Record<CardSize, CardSizeSpec> = {
	bridge: {
		labelKey: 'ui.card-size-bridge',
		mmLabel: '57 × 89',
		portrait: { w: 588, h: 915 },
		classic: { w: 1167, h: 750 },
		landscape: { w: 915, h: 588 },
	},
	poker: {
		labelKey: 'ui.card-size-poker',
		mmLabel: '63 × 88',
		portrait: { w: 654, h: 915 },
		classic: { w: 1167, h: 834 },
		landscape: { w: 915, h: 654 },
	},
};

/** PNG export runs at 2× the preview dimensions. */
export const EXPORT_SCALE = 2;

const STORAGE_KEY = 'warcry-card-size';

class CardSizeStore {
	current = $state<CardSize>('bridge');

	/* Restored at construction rather than from onMount, so the first client
	   render already uses the saved size instead of resizing after hydration. */
	constructor() {
		if (typeof localStorage === 'undefined') return;
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved && saved in CARD_SIZES) this.current = saved as CardSize;
	}

	get spec() { return CARD_SIZES[this.current]; }
	get portrait() { return this.spec.portrait; }
	get classic() { return this.spec.classic; }
	get landscape() { return this.spec.landscape; }

	set(size: CardSize) {
		this.current = size;
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, size);
	}
}

export const cardSize = new CardSizeStore();
