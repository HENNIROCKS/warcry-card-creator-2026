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
}
