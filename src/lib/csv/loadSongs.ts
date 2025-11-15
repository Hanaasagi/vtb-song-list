import { parse } from 'csv-parse/sync';
import { pinyin } from 'pinyin-pro';
import { toHiragana, toRomaji } from 'wanakana';
import songsCsv from '../../data/songs.csv?raw';
import type {
	SongDataset,
	SongDatasetMeta,
	SongGrouping,
	SongRecord,
	SongTokens,
} from '../../types/song';

const KANA_ROWS = [
	{ key: 'あ', chars: ['あ', 'ぁ', 'い', 'ぃ', 'う', 'ぅ', 'ゔ', 'え', 'ぇ', 'お', 'ぉ'] },
	{ key: 'か', chars: ['か', 'が', 'き', 'ぎ', 'く', 'ぐ', 'け', 'げ', 'こ', 'ご'] },
	{ key: 'さ', chars: ['さ', 'ざ', 'し', 'じ', 'す', 'ず', 'せ', 'ぜ', 'そ', 'ぞ'] },
	{ key: 'た', chars: ['た', 'だ', 'ち', 'ぢ', 'つ', 'づ', 'て', 'で', 'と', 'ど'] },
	{ key: 'な', chars: ['な', 'に', 'ぬ', 'ね', 'の'] },
	{ key: 'は', chars: ['は', 'ば', 'ぱ', 'ひ', 'び', 'ぴ', 'ふ', 'ぶ', 'ぷ', 'へ', 'べ', 'ぺ', 'ほ', 'ぼ', 'ぽ'] },
	{ key: 'ま', chars: ['ま', 'み', 'む', 'め', 'も'] },
	{ key: 'や', chars: ['や', 'ゃ', 'ゆ', 'ゅ', 'よ', 'ょ'] },
	{ key: 'ら', chars: ['ら', 'り', 'る', 'れ', 'ろ'] },
	{ key: 'わ', chars: ['わ', 'ゎ', 'ゐ', 'ゑ', 'を'] },
	{ key: 'ん', chars: ['ん'] },
] as const;

const KANA_ORDER = new Map(KANA_ROWS.map((row, index) => [row.key, index]));

const FIELD_ALIASES = {
	id: 'id',
	ID: 'id',
	歌名: 'title',
	title: 'title',
	Title: 'title',
	歌手: 'artist',
	artist: 'artist',
	Artist: 'artist',
	语种: 'language',
	language: 'language',
	Language: 'language',
	主打歌: 'featured',
	featured: 'featured',
	Featured: 'featured',
	SC: 'sc',
	sc: 'sc',
} as const satisfies Record<string, keyof SongRecord>;

const FIELD_ALIAS_LOOKUP = Object.fromEntries(
	Object.entries(FIELD_ALIASES).map(([alias, canonical]) => [alias.toLowerCase(), canonical])
) as Record<string, keyof SongRecord>;

type RawRecord = Record<string, string | undefined>;

const resolveColumnName = (column: string): string =>
	(FIELD_ALIAS_LOOKUP[column.trim().toLowerCase()] as string | undefined) ?? column.trim();

/**
 * 从 CSV 记录中读取指定字段的值。
 */
const readField = (record: RawRecord, field: keyof typeof FIELD_ALIASES): string | undefined => {
	const targetKey = FIELD_ALIASES[field];

	for (const [rawKey, value] of Object.entries(record)) {
		if (FIELD_ALIAS_LOOKUP[rawKey.toLowerCase()] === targetKey) {
			return value;
		}
	}
	return record[targetKey];
};

/**
 * 将任何可选字符串标准化为去除多余空白的形式。
 */
const normalizeText = (value: string | undefined): string => (value ?? '').trim();

/**
 * 将文本转换为拼音数组（无音调、无空格）。
 */
const toPinyinSegments = (value: string): string[] => {
	if (!value) {
		return [];
	}
	const rawSegments = pinyin(value, {
		toneType: 'none',
		type: 'array',
		multiple: false,
	});

	if (!Array.isArray(rawSegments)) {
		return [];
	}

	return rawSegments.map((segment) => segment.replace(/\s+/g, '').toLowerCase()).filter(Boolean);
};

/**
 * 生成所有可供搜索的 token。
 */
const buildTokens = (title: string, artist: string): SongTokens => {
	const titleNormalized = title.toLowerCase();
	const artistNormalized = artist.toLowerCase();

	const titlePinyinCompact = toPinyinSegments(title);
	const artistPinyinCompact = toPinyinSegments(artist);

	const titleKana = toHiragana(title, { passRomaji: true }).trim();
	const artistKana = toHiragana(artist, { passRomaji: true }).trim();
	const titleRomaji = toRomaji(title).trim().toLowerCase();
	const artistRomaji = toRomaji(artist).trim().toLowerCase();

	const combined = [
		titleNormalized,
		artistNormalized,
		titleNormalized.replace(/\s+/g, ''),
		artistNormalized.replace(/\s+/g, ''),
		...titlePinyinCompact,
		...artistPinyinCompact,
		titleKana.replace(/\s+/g, ''),
		artistKana.replace(/\s+/g, ''),
		titleRomaji.replace(/\s+/g, ''),
		artistRomaji.replace(/\s+/g, ''),
	].filter(Boolean);

	const uniqueTokens = Array.from(new Set(combined));

	return {
		titleNormalized,
		artistNormalized,
		titlePinyinCompact,
		artistPinyinCompact,
		titleKana,
		artistKana,
		titleRomaji,
		artistRomaji,
		allTokens: uniqueTokens,
	};
};

/**
 * 解析布尔字段，接受 1/0、true/false、是/否 等值。
 */
const parseBoolean = (value: string | undefined): boolean => {
	if (!value) {
		return false;
	}
	const normalized = value.toLowerCase().trim();
	return ['1', 'true', 'yes', 'y', '是', '主打', 'sc', 'on', '✓', '✔️'].includes(normalized);
};

const resolveKanaGrouping = (char: string): SongGrouping | null => {
	const row = KANA_ROWS.find((entry) => entry.chars.includes(char));
	if (!row) {
		return null;
	}

	return { key: row.key, label: row.key };
};

/**
 * 推断歌曲的首字母／假名分组。
 */
const deriveGrouping = (title: string): SongGrouping => {
	const trimmed = title.trim();
	if (!trimmed) {
		return { key: '#', label: '#' };
	}
	const firstChar = trimmed[0];

	if (/[a-zA-Z]/.test(firstChar)) {
		const upper = firstChar.toUpperCase();
		return { key: upper, label: upper };
	}

	const kanaCandidate = toHiragana(firstChar).trim();
	if (kanaCandidate) {
		const grouping = resolveKanaGrouping(kanaCandidate[0]);
		if (grouping) {
			return grouping;
		}
	}

	const pinyinHead = pinyin(firstChar, {
		toneType: 'none',
		type: 'string',
		multiple: false,
	}) as string;

	if (pinyinHead && typeof pinyinHead === 'string' && pinyinHead.length > 0) {
		const upper = pinyinHead[0]?.toUpperCase() ?? '#';
		return { key: upper, label: upper };
	}

	if (/\d/.test(firstChar)) {
		return { key: '#', label: '#' };
	}

	return { key: '#', label: '#' };
};

/**
 * 对分组进行排序：拉丁字母优先，其次假名，最后其他符号。
 */
const sortGroupings = (groupings: SongGrouping[]): SongGrouping[] => {
	const classify = (key: string): number => {
		if (/[A-Z]/.test(key)) return 0;
		if (key.match(/[\u3040-\u309f\u30a0-\u30ff]/)) return 1;
		return 2;
	};

	return [...groupings].sort((a, b) => {
		const classDiff = classify(a.key) - classify(b.key);
		if (classDiff !== 0) return classDiff;
		const aKanaIndex = KANA_ORDER.get(a.key);
		const bKanaIndex = KANA_ORDER.get(b.key);
		if (aKanaIndex !== undefined && bKanaIndex !== undefined) {
			return aKanaIndex - bKanaIndex;
		}
		return a.key.localeCompare(b.key, 'ja');
	});
};

/**
 * 构建歌曲数据集，同时输出各类元信息。
 */
export const loadSongDataset = (): SongDataset => {
	const records = parse(songsCsv, {
		columns: (header: string[]) => header.map((column) => resolveColumnName(column)),
		skip_empty_lines: true,
		trim: true,
	}) as RawRecord[];

	const songs: SongRecord[] = records.map((record, index) => {
		const idValue = normalizeText(readField(record, 'id'));
		const title = normalizeText(readField(record, 'title')) || `未命名歌曲 ${index + 1}`;
		const artist = normalizeText(readField(record, 'artist')) || '未知歌手';
		const language = normalizeText(readField(record, 'language')) || '未分类';
		const featured = parseBoolean(readField(record, 'featured'));
		const sc = parseBoolean(readField(record, 'sc'));

		const tokens = buildTokens(title, artist);
		const grouping = deriveGrouping(title);

		return {
			id: idValue || String(index + 1),
			order: index,
			title,
			artist,
			language,
			featured,
			sc,
			grouping,
			tokens,
		};
	});

	const meta = buildDatasetMeta(songs);

	return {
		songs,
		meta,
	};
};

/**
 * 汇总数据集的元信息。
 */
const buildDatasetMeta = (songs: SongRecord[]): SongDatasetMeta => {
	const languages = Array.from(new Set(songs.map((song) => song.language))).sort((a, b) =>
		a.localeCompare(b, 'zh-Hans-u-co-pinyin')
	);
	const artists = Array.from(new Set(songs.map((song) => song.artist))).sort((a, b) =>
		a.localeCompare(b, 'zh-Hans-u-co-pinyin')
	);

	const groupingMap = new Map<string, SongGrouping>();
	for (const song of songs) {
		if (!groupingMap.has(song.grouping.key)) {
			groupingMap.set(song.grouping.key, song.grouping);
		}
	}

	const groupings = sortGroupings(Array.from(groupingMap.values()));

	return {
		total: songs.length,
		languages,
		artists,
		groupings,
	};
};

export type { SongDataset, SongRecord } from '../../types/song';

