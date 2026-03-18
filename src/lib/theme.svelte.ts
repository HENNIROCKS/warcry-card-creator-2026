class Theme {
	dark = $state(true);

	init() {
		if (typeof document === 'undefined') return;
		// Inline script already set data-theme (respecting localStorage + system pref) — just sync state
		const val = document.documentElement.getAttribute('data-theme') ?? 'dark';
		this.dark = val !== 'light';
	}

	toggle() {
		this.dark = !this.dark;
		const val = this.dark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', val);
		localStorage.setItem('theme', val);
	}
}

export const theme = new Theme();
