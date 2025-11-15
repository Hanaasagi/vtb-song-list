import { useCallback, useEffect, useRef } from 'react';

/**
 * 监听滚动至底部，触发加载更多的回调。
 * @param onIntersect 成功触发加载时调用。
 * @param enabled 是否启用监听。
 */
export const useInfiniteScroll = (onIntersect: () => void, enabled: boolean) => {
	const observerRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		return () => {
			observerRef.current?.disconnect();
		};
	}, []);

	return useCallback(
		(node: Element | null) => {
			observerRef.current?.disconnect();

			if (!enabled || !node) {
				return;
			}

			observerRef.current = new IntersectionObserver((entries) => {
				const entry = entries[0];
				if (entry?.isIntersecting) {
					onIntersect();
				}
			});

			observerRef.current.observe(node);
		},
		[enabled, onIntersect]
	);
};

