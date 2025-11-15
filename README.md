# vtb-song-list

一个使用 **Astro + React + Tailwind CSS** 静态构建的歌单网站，支持拼音 / 假名模糊检索、首字母导航、滚动加载、随机复制等功能。

## 环境要求

- [Bun](https://bun.sh/) ≥ 1.2

## 快速开始

```bash
# 安装依赖
bun install

# 启动开发环境
bun run dev

# 构建静态站点
bun run build
```

> GitHub Pages 部署时需要设置基础路径，工作流已自动注入环境变量：
>
> ```
> ASTRO_BASE=vtb-song-list
> ASTRO_SITE=https://hanaasagi.github.io/vtb-song-list
> ```
>
> 本地开发无需额外配置，默认访问 `http://localhost:4321/`。

## 配置站点

主要配置集中在 `src/config/` 目录，可以根据需求修改。

### 1. 站点信息（`src/config/site.ts`）

```ts
export const siteConfig = {
  profile: {
    avatar: '/assets/avatar.jpg',     // 头像路径
    avatarAlt: '歌单主播头像',        // 头像 alt 文案
  },
  meta: {
    title: '一起来听歌吧',            // 浏览器标签页标题
    description: '静态构建的歌单页面，支持多维搜索与筛选。',
    keywords: ['歌单', 'VTuber', '静态网站', '音乐检索', '多语言搜索'],

  },
  hero: {
    title: 'VTuber 通用歌单',
    subtitle: '这里是简介占位符(支持拼音、假名模糊检索，结合首字母导航快速定位)',
  },
  liveRoom: {
    enabled: true,                    // 是否显示右下角直播浮窗
    roomId: 24530715,
    roomUrl: 'https://live.bilibili.com/{roomId}',
    statusEndpoint: 'https://your-proxy-api?room_id={roomId}',
    embedUrl: 'https://www.bilibili.com/blackboard/live/live-activity-player.html?cid={roomId}&quality=0',
    coverImage: '/assets/avatar.jpg',
    offlineCover: '/assets/avatar.jpg',
    pollIntervalMs: 60000,
  },
};
```

### 2. 主题与背景（`src/config/theme.ts`）

```ts
export const theme = {
  palette: {
    background: '#08070d',
    // ...其他颜色定义
  },
  typography: {
    fontSans: `'Be Vietnam Pro', 'Noto Sans SC', ...`,
  },
  layout: {
    maxWidth: '1080px',
    cardRadius: '18px',
  },
  background: {
    type: 'image',                 // 'color' 或 'image'
    src: '/assets/background.jpg', // 背景图路径
    blur: true,                    // 是否开启模糊
    overlay: 'linear-gradient(...)', // 自定义渐变
  },
};
```

### 3. 歌单数据

将 CSV 数据放在 `src/data/songs.csv`，构建时会自动解析。支持中英字段混写，如 `歌名/title`、`歌手/artist` 等，也会自动生成 ID、拼音、假名索引。

     

## License
MIT License Copyright (c) 2025, Hanaasagi
