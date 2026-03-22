export interface Runemark {
	id: string;
	label: string;
	svg: string; // raw SVG string
}

export interface Weapon {
	name: string;
	range: string;    // e.g. "1" or "3-7"
	attacks: string;
	strength: string;
	damage: string;   // e.g. "2/3"
}

export interface DamageBracket {
	damageRange: string; // e.g. "0-10"
	move: string;
	damage: string;      // e.g. "4/8"
}

export interface FighterCardData {
	name: string;
	subtitle: string;
	modelImage: string | null; // data URL from file upload
	imageOffsetX: number; // 0–100, object-position x
	imageOffsetY: number; // 0–100, object-position y
	imageZoom: number;    // 1–3, scale factor
	imageCaption: string;
	grandAlliance: string;  // left top circle
	faction: string;        // left middle circle
	bladeborn: string;      // left bottom circle
	rightRunemarks: Runemark[]; // up to 3, top-right column (TBD)
	baseSize: string;           // e.g. "ø 32"
	points: string;
	move: string;
	toughness: string;
	wounds: string;
	weapons: [Weapon, Weapon];
	isNamedCharacter: boolean;
	isMonster: boolean;
	showRunemarks: boolean;
	damageBrackets: DamageBracket[]; // typically 5 rows
}

export type ActivationType = 'double' | 'triple' | 'quad' | null;

export interface AbilityCardData {
	name: string;
	cardLabel: string;          // preset slug or custom string — see presetLabels in AbilityForm.svelte
	activationType: ActivationType;
	grandAlliance: string;
	faction: string;
	bladeborn: string;
	fighterRunemarks: Runemark[];
	showRunemarks: boolean;
	flavorText: string;         // italic block, shown above bodyText if non-empty
	prerequisiteText: string;   // shown between flavorText and bodyText if non-empty
	bodyText: string;
	regularPointsValue?: string; // shown on divine-blessings cards
	elitePointsValue?: string;   // shown on divine-blessings cards
}
