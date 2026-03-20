<script lang="ts">
	import '../app.css';
	import { i18n } from '$lib/i18n/index.svelte';
	import { theme } from '$lib/theme.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		theme.init();
		i18n.init();
	});
</script>

{@render children()}
