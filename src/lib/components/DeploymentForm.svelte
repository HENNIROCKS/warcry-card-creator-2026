<script lang="ts">
	import type { DeploymentCardData } from '$lib/types';
	import { t } from '$lib/i18n/index.svelte';

	let { data }: { data: DeploymentCardData } = $props();
</script>

<div class="flex flex-col gap-6">
	<!-- Name -->
	<div class="flex flex-col gap-1.5">
		<label class="text-xs font-semibold uppercase tracking-widest text-zinc-400">
			{t('ui.form-card')}
		</label>
		<input
			type="text"
			bind:value={data.name}
			placeholder="Deployment card name"
			class="w-full rounded bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:ring-1 focus:ring-red-700"
		/>
	</div>
</div>
