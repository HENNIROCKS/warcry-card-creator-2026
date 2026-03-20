import type { LocaleData } from './types';
import en from './locales/en.json';

// Vite picks up any *.json added to this directory — no code change needed for new languages
const allLocales = import.meta.glob('./locales/*.json', { eager: true }) as Record<string, { default: LocaleData }>;

export const availableLocales: Array<{ code: string; language: string }> =
	Object.entries(allLocales)
		.map(([path, mod]) => ({
			code: path.replace('./locales/', '').replace('.json', ''),
			language: mod.default.meta.language,
		}))
		.sort((a, b) => a.code.localeCompare(b.code));

let locale = $state<LocaleData>(en as LocaleData);
let activeCode = $state('en');

export const i18n = {
	get code() { return activeCode; },
	get dir() { return locale.meta.dir; },

	setLocale(newCode: string) {
		const path = `./locales/${newCode}.json`;
		const mod = allLocales[path];
		if (!mod) return;
		locale = mod.default;
		activeCode = newCode;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('warcry-locale', newCode);
		}
	},

	init() {
		if (typeof localStorage === 'undefined') return;
		const saved = localStorage.getItem('warcry-locale');
		if (saved && saved !== 'en') this.setLocale(saved);
	},
};

export function t(key: string, vars?: Record<string, string>): string {
	const dot = key.indexOf('.');
	if (dot === -1) return key;
	const ns = key.slice(0, dot) as keyof LocaleData;
	const id = key.slice(dot + 1);
	const nsObj = locale[ns] as Record<string, string> | undefined;
	const enNsObj = (en as unknown as LocaleData)[ns] as Record<string, string> | undefined;
	let str = nsObj?.[id] ?? enNsObj?.[id] ?? key;
	if (vars) str = str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
	return str;
}
