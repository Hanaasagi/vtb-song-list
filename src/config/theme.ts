export interface ThemePalette {
	/** 页面总背景色。 */
	background: string;
	/** 玻璃面板默认背景。 */
	surface: string;
	/** 悬停时的面板背景。 */
	surfaceHover: string;
	/** 主色调，常用于高亮文字。 */
	primary: string;
	/** 强调色，用于按钮、状态标记。 */
	accent: string;
	/** 正文文字颜色。 */
	textPrimary: string;
	/** 次级文字颜色。 */
	textSecondary: string;
	/** 辅助说明文字颜色。 */
	textMuted: string;
	/** 边框颜色。 */
	border: string;
	/** 背景光晕/强调高亮颜色。 */
	highlight: string;
	/** 主打歌标识颜色。 */
	featured: string;
	/** SC 标识颜色。 */
	sc: string;
	/** Toast 背景颜色。 */
	toastBackground: string;
	/** Toast 文本颜色。 */
	toastText: string;
	/** Toast 边框颜色。 */
	toastBorder: string;
}

export interface ThemeTypography {
	/** 正文字体栈。 */
	fontSans: string;
	/** 等宽字体栈。 */
	fontMono: string;
}

export interface ThemeLayout {
	/** 页面内容最大宽度。 */
	maxWidth: string;
	/** 卡片圆角尺寸。 */
	cardRadius: string;
}

export interface ThemeBackgroundImage {
	/** 图片地址，建议指向 `public` 目录。 */
	src: string;
	/** 是否启用模糊。 */
	blur?: boolean;
	/** 覆盖层渐变色，可选。 */
	overlay?: string;
}

export type ThemeBackgroundMode =
	| { type: 'color' }
	| ({ type: 'image' } & ThemeBackgroundImage);

export interface ThemeConfig {
	palette: ThemePalette;
	typography: ThemeTypography;
	layout: ThemeLayout;
	background: ThemeBackgroundMode;
}

export const theme: ThemeConfig = {
	palette: {
		background: '#08070d',
		surface: 'rgba(21, 20, 31, 0.8)',
		surfaceHover: 'rgba(35, 34, 50, 0.9)',
		primary: '#f9f7ff',
		accent: '#b38bff',
		textPrimary: '#f1ebff',
		textSecondary: '#c5bbdc',
		textMuted: '#8b86a3',
		border: 'rgba(255, 255, 255, 0.08)',
		highlight: 'rgba(179, 139, 255, 0.35)',
		featured: '#ff94d0',
		sc: '#4dd0ff',
		toastBackground: 'rgba(37, 32, 49, 0.92)',
		toastText: '#f9f5ff',
		toastBorder: 'rgba(179, 139, 255, 0.55)',
	},
	typography: {
		fontSans: `'Be Vietnam Pro', 'Noto Sans SC', 'Noto Sans JP', 'Segoe UI', system-ui, sans-serif`,
		fontMono: `'DM Mono', 'Cascadia Code', ui-monospace, SFMono-Regular`,
	},
	layout: {
		maxWidth: '1080px',
		cardRadius: '18px',
	},
	background: {
		type: 'image',
		src: '/assets/background.jpg',
		blur: true,
		overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.75))',
	},
};

