<!--
	Alert shown when a PNG export fails. Shared by all five editors, which set
	`show` from their export handler's catch block.
-->
<script lang="ts">
	import { t } from '$lib/i18n/index.svelte';

	let { show = $bindable(false) }: { show?: boolean } = $props();

	// Auto-dismiss, so the alert cannot outlive the export it belongs to.
	$effect(() => {
		if (!show) return;
		const id = setTimeout(() => { show = false; }, 8000);
		return () => clearTimeout(id);
	});
</script>

{#if show}
	<div
		class="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-lg border border-red-600 bg-red-800 px-4 py-3 text-sm font-semibold text-white shadow-lg"
		role="alert"
	>
		<span>{t('ui.export-failed')}</span>
		<button
			class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
			style="color: #fff; background: rgba(255, 255, 255, 0.2)"
			onclick={() => (show = false)}
		>{t('ui.close')}</button>
	</div>
{/if}
