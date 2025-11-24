import clsx from 'clsx';
import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD = 280;

interface ScrollToTopButtonProps {
	className?: string;
}

export const ScrollToTopButton = ({ className }: ScrollToTopButtonProps) => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const handleScroll = () => {
			const current =
				window.scrollY ||
				document.scrollingElement?.scrollTop ||
				document.documentElement?.scrollTop ||
				document.body?.scrollTop ||
				0;
			setVisible(current > SCROLL_THRESHOLD);
		};

		handleScroll();

		window.addEventListener('scroll', handleScroll, { passive: true });
		document.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
			document.removeEventListener('scroll', handleScroll);
		};
	}, []);

	const handleClick = () => {
		if (typeof window === 'undefined') {
			return;
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label="回到顶部"
			className={clsx(
				'pointer-events-auto inline-flex min-w-[120px] justify-center rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent shadow-lg shadow-accent/20 transition-all duration-300 hover:border-accent/70 hover:bg-accent/20',
				visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
				className
			)}
		>
			<span className="flex items-center gap-2">
				<span aria-hidden>↑</span>
				回到顶部
			</span>
		</button>
	);
};


