interface RandomCopyButtonProps {
	disabled?: boolean;
	onRandomCopy: () => void;
	label?: string;
	className?: string;
}

/**
 * “随机复制一首歌”按钮。
 */
export const RandomCopyButton = ({
	disabled = false,
	onRandomCopy,
	label = '随机复制一首歌',
	className,
}: RandomCopyButtonProps) => (
	<button
		type="button"
		onClick={onRandomCopy}
		disabled={disabled}
		className={`inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent transition hover:border-accent/80 hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50 ${
			className ?? ''
		}`}
	>
		<span>{label}</span>
	</button>
);

