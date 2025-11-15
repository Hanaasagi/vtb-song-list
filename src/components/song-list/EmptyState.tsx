interface EmptyStateProps {
	onReset: () => void;
}

/**
 * 无搜索结果时的提示。
 */
export const EmptyState = ({ onReset }: EmptyStateProps) => (
	<div className="glass-panel flex flex-col items-center gap-4 p-10 text-center text-text-secondary">
		<span className="text-4xl">🌙</span>
		<h3 className="text-lg font-semibold text-text-primary">没有找到匹配的歌曲</h3>
		<p className="text-sm text-text-muted">尝试调整关键字或重置筛选条件。</p>
		<button
			type="button"
			onClick={onReset}
			className="rounded-full border border-border px-4 py-1.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
		>
			重置筛选
		</button>
	</div>
);

