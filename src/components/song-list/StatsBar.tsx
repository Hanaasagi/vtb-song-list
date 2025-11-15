import type { SongDatasetMeta, SongFiltersState } from '../../types/song';

interface StatsBarProps {
	meta: SongDatasetMeta;
	filters: SongFiltersState;
	totalMatching: number;
}

const computeActiveFilters = (filters: SongFiltersState) =>
	['groupKey', 'language', 'artist'].filter((key) => Boolean(filters[key as keyof SongFiltersState])).length +
	(Number(filters.searchTerm.trim().length > 0) ? 1 : 0);

/**
 * 顶部统计栏，概览当前筛选下的歌曲数量。
 */
export const StatsBar = ({ meta, filters, totalMatching }: StatsBarProps) => {
	const activeFilters = computeActiveFilters(filters);

	return (
		<div className="mb-6 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm">
			<div className="text-text-secondary">
				<span className="font-semibold text-text-primary">{totalMatching}</span>
				<span> / </span>
				<span>{meta.total}</span>
				<span className="ml-1">首歌曲</span>
				{activeFilters > 0 && (
					<span className="ml-2 rounded-full bg-accent/10 px-3 py-0.5 text-xs text-accent">
						已应用 {activeFilters} 项条件
					</span>
				)}
			</div>
			<div className="text-xs text-text-muted md:text-sm">
				语种 {meta.languages.length} / 歌手 {meta.artists.length} / 分组 {meta.groupings.length}
			</div>
		</div>
	);
};

