import { useCallback, useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { pinyin } from 'pinyin-pro';
import { toHiragana, toRomaji } from 'wanakana';
import type { SongDataset, SongFiltersState, SongRecord } from '../../../types/song';
import { useInfiniteScroll } from './useInfiniteScroll';

const INITIAL_BATCH = 36;
const BATCH_SIZE = 36;

const DEFAULT_FILTERS: SongFiltersState = {
	searchTerm: '',
	groupKey: null,
	language: null,
	artist: null,
};

const normalizeQuery = (value: string) => value.trim().toLowerCase();

const buildQueryTokens = (term: string): string[] => {
	const normalized = normalizeQuery(term);
	if (!normalized) {
		return [];
	}

	const tokens = new Set<string>();
	tokens.add(normalized);
	tokens.add(normalized.replace(/\s+/g, ''));

	try {
		const pinyinString = pinyin(normalized, {
			toneType: 'none',
			type: 'string',
			multiple: false,
		}) as string;
		if (pinyinString) {
			tokens.add(pinyinString.toLowerCase());
			tokens.add(pinyinString.toLowerCase().replace(/\s+/g, ''));
		}
	} catch {
		// ignore conversion failure
	}

	const kana = toHiragana(normalized, { passRomaji: true });
	if (kana) {
		tokens.add(kana);
		tokens.add(kana.replace(/\s+/g, ''));
	}

	const romaji = toRomaji(normalized).toLowerCase();
	if (romaji) {
		tokens.add(romaji);
		tokens.add(romaji.replace(/\s+/g, ''));
	}

	return Array.from(tokens).filter(Boolean);
};

const applyFacetFilters = (songs: SongRecord[], filters: SongFiltersState): SongRecord[] =>
	songs.filter((song) => {
		if (filters.groupKey && song.grouping.key !== filters.groupKey) {
			return false;
		}
		if (filters.language && song.language !== filters.language) {
			return false;
		}
		if (filters.artist && song.artist !== filters.artist) {
			return false;
		}
		return true;
	});

/**
 * 处理搜索、过滤及滚动加载的组合逻辑。
 */
export const useSongFiltering = (dataset: SongDataset) => {
	const [filters, setFilters] = useState<SongFiltersState>(() => ({ ...DEFAULT_FILTERS }));

	const fuse = useMemo(
		() =>
			new Fuse(dataset.songs, {
				keys: [
					{ name: 'title', weight: 0.5 },
					{ name: 'artist', weight: 0.3 },
					{ name: 'tokens.titleRomaji', weight: 0.1 },
					{ name: 'tokens.artistRomaji', weight: 0.1 },
				],
				includeScore: true,
				threshold: 0.32,
				ignoreLocation: true,
				minMatchCharLength: 1,
				useExtendedSearch: false,
			}),
		[dataset.songs]
	);

	const baseFiltered = useMemo(
		() => applyFacetFilters(dataset.songs, filters),
		[dataset.songs, filters]
	);

	const searchedSongs = useMemo(() => {
		if (!filters.searchTerm) {
			return baseFiltered;
		}

		const allowedIds = new Set(baseFiltered.map((song) => song.id));
		const queryTokens = buildQueryTokens(filters.searchTerm);

		const scoredMap = new Map<
			string,
			{
				song: SongRecord;
				score: number;
			}
		>();

		const fuseResults = fuse.search(filters.searchTerm);
		for (const result of fuseResults) {
			if (!allowedIds.has(result.item.id)) continue;
			const score = result.score ?? 0;
			const existing = scoredMap.get(result.item.id);
			if (!existing || score < existing.score) {
				scoredMap.set(result.item.id, {
					song: result.item,
					score,
				});
			}
		}

		if (queryTokens.length > 0) {
			for (const song of baseFiltered) {
				const matched = queryTokens.some((token) =>
					song.tokens.allTokens.some((candidate) => candidate.includes(token))
				);
				if (matched) {
					const existing = scoredMap.get(song.id);
					if (!existing) {
						scoredMap.set(song.id, {
							song,
							score: 0.75,
						});
					} else {
						existing.score = Math.min(existing.score, 0.1);
					}
				}
			}
		}

		const sorted = Array.from(scoredMap.values())
			.sort((a, b) => {
				const scoreDiff = a.score - b.score;
				if (Math.abs(scoreDiff) > 0.0001) {
					return scoreDiff;
				}
				return a.song.order - b.song.order;
			})
			.map((entry) => entry.song);

		return sorted;
	}, [baseFiltered, filters.searchTerm, fuse]);

	const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);

	useEffect(() => {
		setVisibleCount(INITIAL_BATCH);
	}, [filters.groupKey, filters.language, filters.artist, filters.searchTerm]);

	const hasMore = visibleCount < searchedSongs.length;

	const loadMore = useCallback(() => {
		setVisibleCount((count) => Math.min(count + BATCH_SIZE, searchedSongs.length));
	}, [searchedSongs.length]);

	const sentinelRef = useInfiniteScroll(loadMore, hasMore);

	const displayedSongs = useMemo(
		() => searchedSongs.slice(0, visibleCount),
		[searchedSongs, visibleCount]
	);

	const setSearchTerm = useCallback((value: string) => {
		setFilters((prev) => ({ ...prev, searchTerm: value }));
	}, []);

	const setGroupKey = useCallback((value: string | null) => {
		setFilters((prev) => ({
			...prev,
			groupKey: prev.groupKey === value ? null : value,
		}));
	}, []);

	const setLanguage = useCallback((value: string | null) => {
		setFilters((prev) => ({
			...prev,
			language: prev.language === value ? null : value,
		}));
	}, []);

	const setArtist = useCallback((value: string | null) => {
		setFilters((prev) => ({
			...prev,
			artist: prev.artist === value ? null : value,
		}));
	}, []);

	const resetFilters = useCallback(() => {
		setFilters({ ...DEFAULT_FILTERS });
	}, []);

	return {
		filters,
		displayedSongs,
		filteredSongs: searchedSongs,
		totalMatching: searchedSongs.length,
		hasMore,
		sentinelRef,
		setSearchTerm,
		setGroupKey,
		setLanguage,
		setArtist,
		resetFilters,
	};
};

