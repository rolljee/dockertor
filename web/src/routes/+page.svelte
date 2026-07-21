<script lang="ts">
	import {
		type Container,
		type StateKind,
		STATE_STYLES,
		splitList,
		shortId,
		stateKind
	} from '$lib/containers';

	const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
	const REFRESH_INTERVAL = 5000;

	let containers = $state<Container[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let lastUpdated = $state<Date | null>(null);

	let search = $state('');
	let stateFilter = $state<'all' | StateKind>('all');
	let autoRefresh = $state(true);
	let copiedId = $state<string | null>(null);
	let expanded = $state<Record<string, boolean>>({});

	async function load(): Promise<void> {
		error = null;
		try {
			const res = await fetch(`${API_URL}/api/containers`);
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error ?? `Request failed (${res.status})`);
			}
			containers = Array.isArray(data) ? data : [];
			lastUpdated = new Date();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	}

	// Initial load + auto-refresh loop (re-armed whenever autoRefresh changes).
	$effect(() => {
		load();
		if (!autoRefresh) return;
		const id = setInterval(load, REFRESH_INTERVAL);
		return () => clearInterval(id);
	});

	const counts = $derived.by(() => {
		const acc = { all: containers.length, running: 0, exited: 0, paused: 0, other: 0 };
		for (const c of containers) {
			const kind = stateKind(c.State);
			if (kind === 'running') acc.running++;
			else if (kind === 'exited') acc.exited++;
			else if (kind === 'paused') acc.paused++;
			else acc.other++;
		}
		return acc;
	});

	const filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return containers.filter((c) => {
			if (stateFilter !== 'all' && stateKind(c.State) !== stateFilter) return false;
			if (!q) return true;
			return (
				c.Names?.toLowerCase().includes(q) ||
				c.Image?.toLowerCase().includes(q) ||
				c.ID?.toLowerCase().includes(q)
			);
		});
	});

	const filters: { key: 'all' | StateKind; label: string; count: number }[] = $derived([
		{ key: 'all', label: 'All', count: counts.all },
		{ key: 'running', label: 'Running', count: counts.running },
		{ key: 'exited', label: 'Exited', count: counts.exited },
		{ key: 'paused', label: 'Paused', count: counts.paused }
	]);

	async function copyId(id: string): Promise<void> {
		try {
			await navigator.clipboard.writeText(id);
			copiedId = id;
			setTimeout(() => {
				if (copiedId === id) copiedId = null;
			}, 1500);
		} catch {
			/* clipboard unavailable (e.g. non-secure context) — ignore */
		}
	}

	function toggle(id: string): void {
		expanded = { ...expanded, [id]: !expanded[id] };
	}

	function timeAgo(date: Date | null): string {
		if (!date) return '—';
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	}
</script>

<svelte:head>
	<title>Dockertor — container inspector</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<header
		class="sticky top-0 z-10 border-b border-border bg-surface-0/85 backdrop-blur"
	>
		<div class="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
			<div class="flex items-center gap-3">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent"
					aria-hidden="true"
				>
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
						<rect x="3" y="10" width="4" height="4" rx="0.5" />
						<rect x="8" y="10" width="4" height="4" rx="0.5" />
						<rect x="13" y="10" width="4" height="4" rx="0.5" />
						<rect x="8" y="5" width="4" height="4" rx="0.5" />
						<path d="M3 14h16a3 3 0 0 0 3-3" />
					</svg>
				</div>
				<div>
					<h1 class="text-lg font-semibold tracking-tight">Dockertor</h1>
					<p class="text-xs text-slate-400">Container inspector</p>
				</div>
			</div>

			<div class="ml-auto flex items-center gap-3 text-sm">
				<span class="hidden text-slate-400 sm:inline">
					Updated <span class="font-mono text-slate-300">{timeAgo(lastUpdated)}</span>
				</span>
				<label
					class="flex cursor-pointer items-center gap-2 text-slate-300 select-none"
					title="Refresh every 5s"
				>
					<input type="checkbox" bind:checked={autoRefresh} class="accent-accent" />
					Auto
				</label>
				<button
					onclick={load}
					class="flex items-center gap-1.5 rounded-md border border-border bg-surface-1 px-3 py-1.5 font-medium text-slate-200 transition hover:bg-surface-2"
				>
					<svg
						class="h-4 w-4 {loading ? 'animate-spin' : ''}"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
					>
						<path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v4h-4" />
					</svg>
					Refresh
				</button>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
		<!-- Stats -->
		<section class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#each [{ label: 'Total', value: counts.all, dot: 'bg-slate-400' }, { label: 'Running', value: counts.running, dot: 'bg-emerald-400' }, { label: 'Exited', value: counts.exited, dot: 'bg-rose-500' }, { label: 'Paused', value: counts.paused, dot: 'bg-amber-400' }] as stat}
				<div class="rounded-lg border border-border bg-surface-1 px-4 py-3">
					<div class="flex items-center gap-2 text-xs font-medium text-slate-400">
						<span class="h-2 w-2 rounded-full {stat.dot}"></span>
						{stat.label}
					</div>
					<div class="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</div>
				</div>
			{/each}
		</section>

		<!-- Toolbar -->
		<section class="mb-5 flex flex-wrap items-center gap-3">
			<div class="relative flex-1 sm:min-w-64 sm:flex-none">
				<svg
					class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
				>
					<circle cx="11" cy="11" r="7" />
					<path d="m20 20-3.5-3.5" />
				</svg>
				<input
					type="search"
					bind:value={search}
					placeholder="Search name, image or ID…"
					class="w-full rounded-md border border-border bg-surface-1 py-2 pr-3 pl-9 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
				/>
			</div>

			<div class="flex flex-wrap gap-1.5">
				{#each filters as f}
					<button
						onclick={() => (stateFilter = f.key)}
						class="rounded-md px-3 py-1.5 text-sm font-medium transition {stateFilter === f.key
							? 'bg-accent text-slate-900'
							: 'border border-border bg-surface-1 text-slate-300 hover:bg-surface-2'}"
					>
						{f.label}
						<span class="ml-1 tabular-nums opacity-70">{f.count}</span>
					</button>
				{/each}
			</div>
		</section>

		<!-- States -->
		{#if error}
			<div
				class="flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
			>
				<svg class="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
					<circle cx="12" cy="12" r="9" />
					<path d="M12 8v4m0 4h.01" />
				</svg>
				<div>
					<p class="font-medium">Could not reach the Dockertor API</p>
					<p class="mt-0.5 font-mono text-xs text-rose-300/80">{error}</p>
				</div>
			</div>
		{:else if loading && containers.length === 0}
			<div class="py-20 text-center text-slate-400">
				<svg class="mx-auto h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
					<path d="M21 12a9 9 0 1 1-2.64-6.36" />
				</svg>
				<p class="mt-3 text-sm">Loading containers…</p>
			</div>
		{:else if filtered.length === 0}
			<div class="rounded-lg border border-dashed border-border py-16 text-center text-slate-400">
				<p class="text-sm">No containers match your filters.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
				{#each filtered as container (container.ID)}
					{@const style = STATE_STYLES[stateKind(container.State)]}
					{@const ports = splitList(container.Ports)}
					{@const mounts = splitList(container.Mounts)}
					{@const networks = splitList(container.Networks)}
					{@const labels = splitList(container.Labels)}
					<article
						class="rounded-xl border border-border bg-surface-1 p-4 transition hover:border-slate-600"
					>
						<!-- Card header -->
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<span class="h-2.5 w-2.5 shrink-0 rounded-full {style.dot}"></span>
									<h2 class="truncate font-semibold text-slate-100" title={container.Names}>
										{container.Names || '(unnamed)'}
									</h2>
								</div>
								<p class="mt-1 truncate font-mono text-xs text-slate-400" title={container.Image}>
									{container.Image}
								</p>
							</div>
							<span
								class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset {style.badge}"
							>
								{style.label}
							</span>
						</div>

						<!-- Key facts -->
						<dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
							<div class="min-w-0">
								<dt class="text-xs text-slate-500">Container ID</dt>
								<dd class="mt-0.5 flex items-center gap-1.5">
									<code class="font-mono text-slate-300">{shortId(container.ID)}</code>
									<button
										onclick={() => copyId(container.ID)}
										title="Copy full ID"
										class="text-slate-500 transition hover:text-slate-200"
										aria-label="Copy container ID"
									>
										{#if copiedId === container.ID}
											<svg class="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<path d="M20 6 9 17l-5-5" />
											</svg>
										{:else}
											<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
												<rect x="9" y="9" width="11" height="11" rx="2" />
												<path d="M5 15V5a2 2 0 0 1 2-2h10" />
											</svg>
										{/if}
									</button>
								</dd>
							</div>
							<div class="min-w-0">
								<dt class="text-xs text-slate-500">Status</dt>
								<dd class="mt-0.5 truncate text-slate-300" title={container.Status}>
									{container.Status || '—'}
								</dd>
							</div>
							<div class="min-w-0">
								<dt class="text-xs text-slate-500">Created</dt>
								<dd class="mt-0.5 truncate text-slate-300" title={container.CreatedAt}>
									{container.RunningFor || '—'}
								</dd>
							</div>
							<div class="min-w-0">
								<dt class="text-xs text-slate-500">Networks</dt>
								<dd class="mt-0.5 truncate text-slate-300">
									{networks.join(', ') || '—'}
								</dd>
							</div>
						</dl>

						<!-- Ports -->
						<div class="mt-4">
							<div class="text-xs text-slate-500">Ports</div>
							{#if ports.length}
								<div class="mt-1.5 flex flex-wrap gap-1.5">
									{#each ports as port}
										<span
											class="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-slate-300"
										>
											{port}
										</span>
									{/each}
								</div>
							{:else}
								<p class="mt-1 text-sm text-slate-500">No published ports</p>
							{/if}
						</div>

						<!-- Details toggle -->
						{#if container.Command || mounts.length || labels.length || container.Size}
							<button
								onclick={() => toggle(container.ID)}
								class="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-slate-200"
							>
								<svg
									class="h-3.5 w-3.5 transition-transform {expanded[container.ID] ? 'rotate-90' : ''}"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path d="m9 6 6 6-6 6" />
								</svg>
								{expanded[container.ID] ? 'Hide details' : 'Show details'}
							</button>

							{#if expanded[container.ID]}
								<div class="mt-3 space-y-3 border-t border-border pt-3 text-sm">
									{#if container.Command}
										<div>
											<div class="text-xs text-slate-500">Command</div>
											<code class="mt-0.5 block overflow-x-auto rounded bg-surface-0 p-2 font-mono text-xs text-slate-300">
												{container.Command}
											</code>
										</div>
									{/if}
									{#if mounts.length}
										<div>
											<div class="text-xs text-slate-500">Mounts</div>
											<ul class="mt-1 space-y-1">
												{#each mounts as mount}
													<li class="truncate font-mono text-xs text-slate-300" title={mount}>{mount}</li>
												{/each}
											</ul>
										</div>
									{/if}
									{#if container.Size}
										<div>
											<div class="text-xs text-slate-500">Size</div>
											<div class="mt-0.5 font-mono text-xs text-slate-300">{container.Size}</div>
										</div>
									{/if}
									{#if labels.length}
										<div>
											<div class="text-xs text-slate-500">Labels</div>
											<div class="mt-1 flex flex-wrap gap-1.5">
												{#each labels as label}
													<span class="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-slate-400">{label}</span>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							{/if}
						{/if}
					</article>
				{/each}
			</div>
		{/if}
	</main>
</div>

