import type { SongRecord } from '../../types/song';
import { Badge } from '../common/Badge';

interface SongGridProps {
	songs: SongRecord[];
	onCopy: (song: SongRecord) => void;
	sentinelRef: (node: Element | null) => void;
	hasMore: boolean;
}

interface SongCardProps {
	song: SongRecord;
	onCopy: () => void;
}

/**
 * 单条歌曲卡片。
 */
const SongCard = ({ song, onCopy }: SongCardProps) => (
	<article className="group relative rounded-card border border-border bg-surface/70 p-4 transition hover:-translate-y-1 hover:bg-surface-hover hover:shadow-lg hover:shadow-highlight/20">
		<header className="flex items-start justify-between gap-2">
			<div>
				<h3
					title="双击复制歌名"
					onDoubleClick={onCopy}
					className="cursor-copy text-lg font-semibold text-text-primary transition group-hover:text-accent"
				>
					{song.title}
				</h3>
				<p className="text-sm text-text-secondary">{song.artist}</p>
			</div>
			<button
				type="button"
				onClick={onCopy}
				className="rounded-full border border-border px-3 py-1 text-xs text-text-muted transition hover:border-accent hover:text-accent"
			>
				复制
			</button>
		</header>

		<footer className="mt-4 flex flex-wrap items-center gap-2">
			<Badge variant="accent">{song.language}</Badge>
			{song.featured && <Badge variant="featured">主打歌</Badge>}
			{song.sc && <Badge variant="sc">SC</Badge>}
			<span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-text-muted">
				#{song.id.toString().padStart(3, '0')}
			</span>
		</footer>
	</article>
);

/**
 * 歌曲列表网格，包含无限滚动的 sentinel。
 */
export const SongGrid = ({ songs, onCopy, sentinelRef, hasMore }: SongGridProps) => (
	<section className="grid grid-cols-1 gap-4 md:grid-cols-2">
		{songs.map((song) => (
			<SongCard key={song.id} song={song} onCopy={() => onCopy(song)} />
		))}
		<div ref={sentinelRef} aria-hidden className="h-px w-full" />
		{!hasMore && songs.length > 0 && (
			<p className="col-span-full text-center text-xs text-text-muted">已经到底啦，没有更多歌曲。</p>
		)}
	</section>
);

