import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { siteConfig } from '../../config/site';
import { withBase } from '../../lib/url/withBase';

interface LiveStatusState {
	isLive: boolean;
	title: string;
	cover?: string;
	area?: string;
	watchers?: number | null;
	lastUpdated: number;
}

const resolveTemplate = (template: string | undefined, roomId: number): string | null => {
	if (!template) {
		return null;
	}
	return template.replace(/\{roomId\}/g, String(roomId));
};

const formatWatchers = (value: number | null | undefined): string | null => {
	if (typeof value !== 'number' || Number.isNaN(value)) {
		return null;
	}
	if (value >= 10000) {
		return `${(value / 10000).toFixed(1)}万`;
	}
	return `${value}`;
};

const pickCover = (status: LiveStatusState, coverFallback?: string, offlineFallback?: string, defaultFallback?: string) =>
	status.isLive
		? status.cover || coverFallback || defaultFallback
		: offlineFallback || coverFallback || defaultFallback;

const parseLiveStatus = (payload: unknown): LiveStatusState => {
	const now = Date.now();

	const namespaces = [
		(payload as Record<string, unknown>)?.data,
		(payload as Record<string, unknown>)?.room_info,
		payload,
	].filter(Boolean) as Record<string, unknown>[];

	const findValue = <T,>(predicate: (candidate: Record<string, unknown>) => T | undefined): T | undefined => {
		for (const namespace of namespaces) {
			const result = predicate(namespace);
			if (result !== undefined && result !== null) {
				return result;
			}
		}
		return undefined;
	};

	const liveStatus = Number(
		findValue((data) => data.live_status ?? data.liveStatus ?? data.live?.status ?? data.roomStatus)
	);

	const title =
		findValue((data) => data.title ?? data.live_title ?? data.roomTitle ?? data.name) ?? '直播间';

	const area = findValue(
		(data) =>
			data.area_name ??
			data.areaName ??
			data.parent_area_name ??
			data.parent_area ??
			data.area ??
			data.tag_name
	);

	const cover =
		findValue(
			(data) =>
				data.user_cover ??
				data.cover ??
				data.keyframe ??
				data.system_cover ??
				data.background ??
				data.pic
		) ?? undefined;

	const watchersRaw = findValue(
		(data) =>
			data.online ??
			data.online_count ??
			data.watcher_count ??
			data.user_count ??
			data.fans_num ??
			data.audience_count
	);

	const watchers =
		typeof watchersRaw === 'number'
			? watchersRaw
			: typeof watchersRaw === 'string'
				? Number(watchersRaw)
				: undefined;

	return {
		isLive: liveStatus === 1,
		title: String(title),
		cover: typeof cover === 'string' ? cover : undefined,
		area: typeof area === 'string' ? area : undefined,
		watchers: watchers ?? null,
		lastUpdated: now,
	};
};

interface LiveRoomWidgetProps {
	className?: string;
}

export const LiveRoomWidget = ({ className }: LiveRoomWidgetProps) => {
	const config = siteConfig.liveRoom;
	const resolveAssetPath = (path: string | undefined) => {
		if (!path) return undefined;
		if (/^https?:\/\//.test(path)) return path;
		return withBase(path);
	};
	const profileFallback = resolveAssetPath(siteConfig.profile.avatar);

	const [isExpanded, setIsExpanded] = useState(true);
	const [isDesktop, setIsDesktop] = useState(
		typeof window !== 'undefined' ? window.innerWidth >= 768 : false
	);
	const [status, setStatus] = useState<LiveStatusState>({
		isLive: false,
		title: '直播间',
		lastUpdated: Date.now(),
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [previewActive, setPreviewActive] = useState(false);
	const [previewMounted, setPreviewMounted] = useState(false);
	const previewTimerRef = useRef<number | null>(null);

	const statusUrl = useMemo(() => {
		if (!config || !config.enabled) {
			return null;
		}
		return resolveTemplate(config.statusEndpoint, config.roomId);
	}, [config]);

	const embedUrl = useMemo(() => {
		if (!config || !config.enabled) {
			return null;
		}
		const resolved = resolveTemplate(config.embedUrl, config.roomId);
		return resolved ? resolveAssetPath(resolved) ?? resolved : null;
	}, [config]);

	const roomUrl = useMemo(() => {
		if (!config || !config.enabled) {
			return null;
		}
		return resolveTemplate(config.roomUrl, config.roomId) ?? config.roomUrl;
	}, [config]);

	const fetchStatus = useCallback(async () => {
		if (!statusUrl) {
			return;
		}

		try {
			setLoading(true);
			const response = await fetch(statusUrl, {
				cache: 'no-store',
				method: 'GET',
			});
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			const json = await response.json();
			const parsed = parseLiveStatus(json);
			setStatus(parsed);
			setError(null);
		} catch (err) {
			console.warn('获取直播状态失败', err);
			setError(err instanceof Error ? err.message : '未知错误');
		} finally {
			setLoading(false);
		}
	}, [statusUrl]);

	useEffect(() => {
		if (!config?.enabled) {
			return;
		}

		void fetchStatus();

		if (!config.pollIntervalMs) {
			return;
		}

		const timer = window.setInterval(() => {
			void fetchStatus();
		}, config.pollIntervalMs);

		return () => window.clearInterval(timer);
	}, [config?.enabled, config?.pollIntervalMs, fetchStatus]);

	useEffect(() => {
		if (!status.isLive) {
			setPreviewActive(false);
			setPreviewMounted(false);
			if (previewTimerRef.current) {
				window.clearTimeout(previewTimerRef.current);
				previewTimerRef.current = null;
			}
		}
	}, [status.isLive]);

	useEffect(() => {
		if (!isExpanded) {
			setPreviewActive(false);
			setPreviewMounted(false);
			if (previewTimerRef.current) {
				window.clearTimeout(previewTimerRef.current);
				previewTimerRef.current = null;
			}
		}
	}, [isExpanded]);

	useEffect(() => {
		return () => {
			if (previewTimerRef.current) {
				window.clearTimeout(previewTimerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const checkViewport = () => {
			setIsDesktop(window.innerWidth >= 768);
		};

		checkViewport();

		window.addEventListener('resize', checkViewport);
		return () => window.removeEventListener('resize', checkViewport);
	}, []);

	if (!config?.enabled || !isDesktop) {
		return null;
	}
	const coverSrc = resolveAssetPath(
		pickCover(status, config.coverImage, config.offlineCover, profileFallback)
	);
	const watchersText = formatWatchers(status.watchers);
	const headlineText = loading ? '加载直播状态…' : status.isLive ? '直播中' : '主播未开播';
	const subtitleText = loading ? '正在获取直播信息' : status.isLive ? '点击查看直播' : '点击进入直播间';

	const handlePointerEnter = useCallback(() => {
		if (!isExpanded) {
			return;
		}
		if (previewTimerRef.current) {
			window.clearTimeout(previewTimerRef.current);
			previewTimerRef.current = null;
		}
		if (status.isLive && embedUrl) {
			setPreviewMounted(true);
			setPreviewActive(true);
		}
	}, [isExpanded, status.isLive, embedUrl]);

	const handlePointerLeave = useCallback(() => {
		setPreviewActive(false);
		if (previewTimerRef.current) {
			window.clearTimeout(previewTimerRef.current);
		}
		previewTimerRef.current = window.setTimeout(() => {
			setPreviewMounted(false);
			previewTimerRef.current = null;
		}, 240);
	}, []);

	const handleOpenRoom = useCallback(() => {
		if (!roomUrl) {
			return;
		}
		if (typeof window !== 'undefined') {
			window.open(roomUrl, '_blank', 'noreferrer');
		}
	}, [roomUrl]);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				handleOpenRoom();
			}
		},
		[handleOpenRoom]
	);

	return (
		<div className={clsx('flex flex-col items-end gap-2', className)}>
			{isExpanded && (
				<div className="flex items-stretch gap-1 transition duration-300">
					<div className="relative w-[286px] max-w-[80vw] overflow-hidden rounded-2xl border border-border/50 shadow-2xl shadow-highlight/40 backdrop-blur-xl">
					<div
						role="link"
						tabIndex={0}
						onPointerEnter={handlePointerEnter}
						onPointerLeave={handlePointerLeave}
						onFocus={handlePointerEnter}
						onBlur={handlePointerLeave}
						onClick={handleOpenRoom}
						onKeyDown={handleKeyDown}
						className="group relative block cursor-pointer outline-none"
						aria-expanded={isExpanded}
					>
						<div className="relative">
							{coverSrc ? (
								<img
									src={coverSrc}
									alt={status.title}
									loading="lazy"
									className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
								/>
							) : (
								<div className="flex h-40 items-center justify-center bg-surface/60 text-xs text-text-muted">
									暂无封面
								</div>
							)}

							{status.isLive && embedUrl && (
								<div
									className={clsx(
										'absolute inset-0 overflow-hidden rounded-2xl transition-opacity duration-300',
										previewActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
									)}
								>
									{previewMounted && (
										<iframe
											title="直播间预览"
											src={embedUrl}
											className="h-full w-full"
											allow="autoplay; encrypted-media; picture-in-picture"
											allowFullScreen
										/>
									)}
								</div>
							)}

							<div
								className={clsx(
									'absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/80 transition-opacity duration-300',
									previewActive && status.isLive ? 'opacity-0' : 'opacity-100 group-hover:opacity-95'
								)}
							>
								{/* {status.isLive && !loading && (
									<div className="absolute inset-x-5 top-6 flex justify-center">
										<div className="max-w-full truncate text-center text-sm font-semibold text-text-primary sm:text-base">
											{status.title}
										</div>
									</div>
								)} */}
								<div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1">
									<span
										className={clsx(
											'h-2.5 w-2.5 rounded-full',
											status.isLive
												? 'bg-status-featured shadow-[0_0_14px_rgba(255,148,208,0.9)]'
												: 'bg-text-muted'
										)}
									/>
								</div>

								<div className="flex h-full flex-col items-center justify-center px-6 text-center text-text-primary">
									<h3 className="text-lg font-semibold">{headlineText}</h3>
									<p className="mt-2 text-sm text-text-secondary">{subtitleText}</p>
								</div>

								{watchersText && status.isLive && !loading && (
									<div className="absolute bottom-3 right-12 rounded-full bg-black/50 px-3 py-1 text-xs text-text-primary">
										人气 {watchersText}
									</div>
								)}
							</div>
						</div>
					</div>

					{error && (
						<div className="bg-surface/90 px-3 py-2 text-center text-[11px] text-status-featured">
							状态获取失败：{error}
						</div>
					)}

					<button
						type="button"
						onClick={() => setIsExpanded(false)}
						className="absolute inset-y-0 right-0 flex w-8 items-center justify-center bg-white/10 text-lg text-text-secondary transition hover:bg-accent/20 hover:text-accent"
						aria-label="折叠直播间预览"
					>
						&gt;
					</button>
				</div>
				</div>
			)}

			{!isExpanded && (
				<button
					type="button"
					onClick={() => setIsExpanded(true)}
					className="glass-panel flex min-w-[120px] items-center gap-2 rounded-full border border-border/60 bg-surface/90 px-4 py-2 text-sm font-medium text-text-primary shadow-lg shadow-highlight/30 transition hover:border-accent hover:text-accent"
					aria-expanded={isExpanded}
					aria-controls="live-room-panel"
				>
					<span
						className={clsx(
							'h-2.5 w-2.5 rounded-full',
							status.isLive ? 'bg-status-featured shadow-[0_0_12px_rgba(255,148,208,0.8)]' : 'bg-text-muted'
						)}
					/>
					<span>{status.isLive ? '直播中' : '直播间'}</span>
					<span className="text-lg">‹</span>
				</button>
			)}
		</div>
	);
};

