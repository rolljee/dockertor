/**
 * Shape of a container as emitted by `docker ps --format '{{json .}}'`
 * and forwarded by the Dockertor API.
 */
export interface Container {
	ID: string;
	Names: string;
	Image: string;
	Command: string;
	CreatedAt: string;
	RunningFor: string;
	Status: string;
	State: string;
	Ports: string;
	Mounts: string;
	Networks: string;
	Labels: string;
	Size: string;
	LocalVolumes?: string;
}

export type StateKind = 'running' | 'paused' | 'restarting' | 'created' | 'exited' | 'other';

export function stateKind(state: string): StateKind {
	const s = (state ?? '').toLowerCase();
	if (s === 'running') return 'running';
	if (s === 'paused') return 'paused';
	if (s === 'restarting') return 'restarting';
	if (s === 'created') return 'created';
	if (s === 'exited' || s === 'dead') return 'exited';
	return 'other';
}

/** Tailwind classes for the status dot and badge, keyed by state kind. */
export const STATE_STYLES: Record<StateKind, { dot: string; badge: string; label: string }> = {
	running: {
		dot: 'bg-emerald-400',
		badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
		label: 'Running'
	},
	paused: {
		dot: 'bg-amber-400',
		badge: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
		label: 'Paused'
	},
	restarting: {
		dot: 'bg-sky-400 animate-pulse',
		badge: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
		label: 'Restarting'
	},
	created: {
		dot: 'bg-indigo-400',
		badge: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30',
		label: 'Created'
	},
	exited: {
		dot: 'bg-rose-500',
		badge: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
		label: 'Exited'
	},
	other: {
		dot: 'bg-slate-400',
		badge: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
		label: 'Unknown'
	}
};

/** Split a comma-separated docker field into clean, non-empty entries. */
export function splitList(value: string | undefined): string[] {
	return (value ?? '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

export function shortId(id: string): string {
	return (id ?? '').slice(0, 12);
}
