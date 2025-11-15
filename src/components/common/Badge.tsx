import type { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
	children: ReactNode;
	variant?: 'default' | 'accent' | 'featured' | 'sc';
}

/**
 * 用于展示小型状态标签。
 */
export const Badge = ({ children, variant = 'default' }: BadgeProps) => {
	const styles = clsx(
		'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tracking-wide',
		{
			'bg-surface-hover text-text-secondary border border-border': variant === 'default',
			'bg-accent/20 text-accent border border-accent/40': variant === 'accent',
			'bg-status-featured/20 text-status-featured border border-status-featured/40': variant === 'featured',
			'bg-status-sc/20 text-status-sc border border-status-sc/40': variant === 'sc',
		}
	);

	return <span className={styles}>{children}</span>;
};

