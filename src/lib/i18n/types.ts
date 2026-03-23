export interface LocaleMeta {
	language: string;
	code: string;
	dir: 'ltr' | 'rtl';
	contributors: string[];
}

export interface LocaleData {
	meta: LocaleMeta;
	alliances: Record<string, string>;
	factions: Record<string, string>;
	subfactions: Record<string, string>;
	ui: Record<string, string>;
	card: Record<string, string>;
	runemarks: Record<string, string>;
	weapons: Record<string, string>;
	'card-decks': Record<string, string>;
	deployment: Record<string, string>;
	misc: Record<string, string>;
	treasure: Record<string, string>;
	twists: Record<string, string>;
}
