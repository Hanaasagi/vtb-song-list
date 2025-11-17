import type { ChangeEvent } from 'react';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../../config/site';
import { withBase } from '../../lib/url/withBase';
import type { SongDatasetMeta, SongFiltersState } from '../../types/song';
import { RandomCopyButton } from './RandomCopyButton';

interface FiltersPanelProps {
	filters: SongFiltersState;
	meta: SongDatasetMeta;
	onSearchChange: (value: string) => void;
	onGroupSelect: (value: string | null) => void;
	onLanguageChange: (value: string | null) => void;
	onArtistChange: (value: string | null) => void;
	onReset: () => void;
	onRandomCopy: () => void;
	randomDisabled?: boolean;
}

/**
 * 顶部筛选面板，包含搜索框、过滤选择与字母/假名导航。
 */
export const FiltersPanel = ({
	filters,
	meta,
	onSearchChange,
	onGroupSelect,
	onLanguageChange,
	onArtistChange,
	onReset,
	onRandomCopy,
	randomDisabled = false,
}: FiltersPanelProps) => {
	const handleSelectChange =
		(callback: (value: string | null) => void) => (event: ChangeEvent<HTMLSelectElement>) => {
			callback(event.target.value || null);
		};

	const avatarSrc = siteConfig.profile.avatar.startsWith('http')
		? siteConfig.profile.avatar
		: withBase(siteConfig.profile.avatar);

	const [expanded, setExpanded] = useState(true);
	const [isCompact, setIsCompact] = useState(false);
	const manualOverrideRef = useRef(false);

	useEffect(() => {
		if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
			return;
		}

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			const { width } = entry.contentRect;

			const compact = width < 640;
			setIsCompact(compact);

			if (compact) {
				if (!manualOverrideRef.current) {
					setExpanded(false);
				}
			} else {
				setExpanded(true);
				manualOverrideRef.current = false;
			}
		});
		const element = document.getElementById('filters-panel-header');
		if (element) {
			observer.observe(element);
		}
		return () => observer.disconnect();
	}, []);

	return (
		<section
			className={clsx(
				'glass-panel mb-8 flex flex-col p-6 shadow-card transition-[gap] duration-300',
				expanded ? 'gap-6' : 'gap-4'
			)}
		>
			<header
				id="filters-panel-header"
				className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
			>
				<div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
					<div className="group relative aspect-square w-24 overflow-hidden rounded-full border border-border shadow-lg shadow-highlight/40 md:w-24 md:shrink-0">
						<img
							src={avatarSrc}
							alt={siteConfig.profile.avatarAlt}
							loading="lazy"
							className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:rotate-[360deg] group-hover:scale-105"
						/>
						<span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/25 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
					</div>

					<div className="text-center md:text-left">
						<h1 className="text-2xl font-semibold tracking-wide text-text-primary md:text-3xl">
							{siteConfig.hero.title}
						</h1>
						<p className="text-sm text-text-muted md:text-base">
							{siteConfig.hero.subtitle}
						</p>
					</div>
				</div>
				<div className="flex w-full flex-row items-stretch gap-2 self-start md:w-36 md:flex-col">
					{isCompact && (
						<button
							type="button"
							onClick={() => {
								manualOverrideRef.current = true;
								setExpanded((prev) => !prev);
							}}
							className="inline-flex flex-1 justify-center rounded-full border border-border bg-transparent px-4 py-1.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent md:hidden"
						>
							{expanded ? '收起筛选' : '展开筛选'}
						</button>
					)}
					<RandomCopyButton
						disabled={randomDisabled}
						onRandomCopy={onRandomCopy}
						label="随机复制"
						className="flex-1 md:flex-none md:w-full"
					/>
					<button
						type="button"
						onClick={onReset}
						className="inline-flex flex-1 justify-center rounded-full border border-border bg-transparent px-4 py-1.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent md:flex-none md:w-full"
					>
						重置筛选
					</button>
				</div>
			</header>

			{expanded && (
				<>
					<div className="grid gap-4 md:grid-cols-[2fr,1fr,1fr]">
						<div className="relative">
							<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
								🔍
							</span>
							<input
								type="search"
								value={filters.searchTerm}
								onChange={(event) => onSearchChange(event.target.value)}
								placeholder="输入歌名/歌手，支持拼音与假名"
								className="w-full rounded-full border border-border bg-surface/70 py-2 pl-11 pr-4 text-sm outline-none transition focus:border-accent focus:bg-surface focus:text-text-primary"
							/>
						</div>

						<select
							value={filters.language ?? ''}
							onChange={handleSelectChange(onLanguageChange)}
							className="w-full rounded-full border border-border bg-surface/70 px-4 py-2 text-sm text-text-secondary outline-none transition focus:border-accent focus:text-text-primary"
						>
							<option value="">全部语种</option>
							{meta.languages.map((language) => (
								<option key={language} value={language}>
									{language}
								</option>
							))}
						</select>

						<select
							value={filters.artist ?? ''}
							onChange={handleSelectChange(onArtistChange)}
							className="w-full rounded-full border border-border bg-surface/70 px-4 py-2 text-sm text-text-secondary outline-none transition focus:border-accent focus:text-text-primary"
						>
							<option value="">全部歌手</option>
							{meta.artists.map((artist) => (
								<option key={artist} value={artist}>
									{artist}
								</option>
							))}
						</select>
					</div>

					{meta.groupings.length > 0 && (
						<div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
							<button
								type="button"
								onClick={() => onGroupSelect(null)}
								className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition ${
									!filters.groupKey
										? 'bg-accent/20 text-accent shadow-inner'
										: 'bg-surface/70 text-text-secondary hover:bg-surface-hover hover:text-text-primary'
								}`}
							>
								全部
							</button>
							{meta.groupings.map((group) => {
								const active = filters.groupKey === group.key;
								return (
									<button
										type="button"
										key={group.key}
										onClick={() => onGroupSelect(group.key)}
										className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition ${
											active
												? 'bg-accent/30 text-accent shadow-lg shadow-accent/20'
												: 'bg-surface/70 text-text-secondary hover:bg-surface-hover hover:text-text-primary'
										}`}
									>
										{group.label}
									</button>
								);
							})}
						</div>
					)}
				</>
			)}
		</section>
	);
};

