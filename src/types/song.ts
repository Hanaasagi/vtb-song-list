/**
 * 代表单条歌曲数据的索引字段集合。
 */
export interface SongTokens {
	/** 标题的标准化文本，用于直接字符串匹配。 */
	titleNormalized: string;
	/** 歌手名的标准化文本，用于直接字符串匹配。 */
	artistNormalized: string;
	/** 移除空格后的拼音序列。 */
	titlePinyinCompact: string[];
	/** 移除空格后的歌手拼音序列。 */
	artistPinyinCompact: string[];
	/** 日文假名序列。 */
	titleKana: string;
	/** 日文假名序列（歌手）。 */
	artistKana: string;
	/** 罗马音（主要用于日文）。 */
	titleRomaji: string;
	/** 罗马音（歌手）。 */
	artistRomaji: string;
	/** 合并后的所有检索 token。 */
	allTokens: string[];
}

/**
 * 用于构建导航过滤器的首字母／假名分组信息。
 */
export interface SongGrouping {
	/** 分组 key，可能是 A-Z 或假名。 */
	key: string;
	/** 在界面展示的标签文本。 */
	label: string;
}

/**
 * 构建后的歌曲数据实体。
 */
export interface SongRecord {
	/** 字符串形式的主键 id。 */
	id: string;
	/** 原始顺序索引，确保列表稳定。 */
	order: number;
	/** 歌名。 */
	title: string;
	/** 歌手。 */
	artist: string;
	/** 语种。 */
	language: string;
	/** 是否主打歌。 */
	featured: boolean;
	/** 是否为 SC 曲目。 */
	sc: boolean;
	/** 分组信息，用于首字母／假名导航。 */
	grouping: SongGrouping;
	/** 构建出的检索 token 集。 */
	tokens: SongTokens;
}

/**
 * 歌单数据的元信息。
 */
export interface SongDatasetMeta {
	total: number;
	languages: string[];
	artists: string[];
	groupings: SongGrouping[];
}

/**
 * 页面上消费的完整数据集。
 */
export interface SongDataset {
	songs: SongRecord[];
	meta: SongDatasetMeta;
}

/**
 * 页面内部使用的过滤状态。
 */
export interface SongFiltersState {
	searchTerm: string;
	groupKey: string | null;
	language: string | null;
	artist: string | null;
}

