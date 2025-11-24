import { useCallback, useEffect, useState } from 'react';
import type { SongDataset, SongRecord } from '../../types/song';
import { CopyToast } from './CopyToast';
import { EmptyState } from './EmptyState';
import { FiltersPanel } from './FiltersPanel';
import { SongGrid } from './SongGrid';
import { StatsBar } from './StatsBar';
import { useSongFiltering } from './hooks/useSongFiltering';

interface SongExplorerProps {
	dataset: SongDataset;
}

/**
 * 歌单探索器入口组件，串联所有搜索与过滤逻辑。
 */
export const SongExplorer = ({ dataset }: SongExplorerProps) => {
	const {
		filters,
		displayedSongs,
		filteredSongs,
		totalMatching,
		hasMore,
		sentinelRef,
		setSearchTerm,
		setGroupKey,
		setLanguage,
		setArtist,
		resetFilters,
	} = useSongFiltering(dataset);

	const [toastMessage, setToastMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!toastMessage) {
			return;
		}
		const timer = window.setTimeout(() => setToastMessage(null), 2400);
		return () => window.clearTimeout(timer);
	}, [toastMessage]);

	const copySongTitle = useCallback(async (song: SongRecord) => {
		const text = song.title;
		const scSuffix = song.sc ? '（SC 曲目）' : '';
		try {
			if (typeof navigator !== 'undefined' && navigator.clipboard) {
				await navigator.clipboard.writeText(text);
				setToastMessage(`已复制：${text}${scSuffix}`);
				return;
			}
		} catch (error) {
			console.warn('Clipboard copy failed', error);
		}
		setToastMessage('复制失败，请手动复制');
	}, []);

	const handleRandomCopy = useCallback(() => {
		if (filteredSongs.length === 0) {
			return;
		}
		const randomIndex = Math.floor(Math.random() * filteredSongs.length);
		void copySongTitle(filteredSongs[randomIndex]);
	}, [filteredSongs, copySongTitle]);

	return (
		<>
			<CopyToast message={toastMessage} />
			<div className="space-y-6">
				<FiltersPanel
					filters={filters}
					meta={dataset.meta}
					onSearchChange={setSearchTerm}
					onGroupSelect={setGroupKey}
					onLanguageChange={setLanguage}
					onArtistChange={setArtist}
					onReset={resetFilters}
					onRandomCopy={handleRandomCopy}
					randomDisabled={filteredSongs.length === 0}
				/>

				<StatsBar meta={dataset.meta} filters={filters} totalMatching={totalMatching} />

				{displayedSongs.length > 0 ? (
					<SongGrid
						songs={displayedSongs}
						onCopy={copySongTitle}
						sentinelRef={sentinelRef}
						hasMore={hasMore}
					/>
				) : (
					<EmptyState onReset={resetFilters} />
				)}
			</div>
		</>
	);
};

