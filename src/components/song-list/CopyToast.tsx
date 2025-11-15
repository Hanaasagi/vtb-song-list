import clsx from 'clsx';

interface CopyToastProps {
	message: string | null;
}

/**
 * 显示复制成功提示。
 */
export const CopyToast = ({ message }: CopyToastProps) => {
	const visible = Boolean(message);

	return (
		<div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-4">
			<div
				className={clsx(
					'mt-8 flex min-w-[240px] max-w-[92vw] items-center justify-center rounded-2xl border border-toast-border bg-toast-background px-5 py-3 text-sm text-toast-text shadow-2xl shadow-highlight/40 backdrop-blur-xl transition-all duration-300',
					visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
				)}
				role="status"
				aria-live="polite"
			>
				<span className="text-center">{message ?? ''}</span>
			</div>
		</div>
	);
};

