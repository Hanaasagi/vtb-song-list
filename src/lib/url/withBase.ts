/**
 * 封装 Astro 的 BASE_URL，便于在子路径部署时生成正确的静态资源路径。
 */
export const withBase = (path: string): string => {
	const base = import.meta.env.BASE_URL ?? '/';
	if (base === '/') {
		return path.startsWith('/') ? path : `/${path}`;
	}
	const normalizedBase = base.replace(/\/$/, '');
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${normalizedBase}${normalizedPath}`;
};


