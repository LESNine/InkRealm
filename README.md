# 墨境 InkRealm

**AI 辅助网络小说写作工具** — 用"导演式写作"方法，让 AI 写出有血有肉的故事。

---

## 解决什么问题？

用 AI 写小说时，你是否遇到这些困扰：

- ❌ AI 只写关键剧情，章节之间缺乏过渡
- ❌ 只有"大事件"，没有小事件填充（写战争只有首尾两战）
- ❌ 一个大事件一章就写完了，节奏失控
- ❌ 写出来的东西像大纲，不像小说

**墨境**的核心思路是 **"导演式写作"**——你不是让 AI 自由发挥，而是像导演一样拆分场景、设定要求，让 AI 按你的剧本"演出"。

---

## 核心功能

### 🎬 导演式写作流程

```
大纲 → 事件拆解 → 场景设定 → AI 逐场景扩写 → 组装成章节
```

1. **大纲管理** — 将大事件拆解为多个小事件/战役，控制节奏
2. **场景编辑器** — 为每个场景配置时间、地点、人物、感官细节、写作要求
3. **AI 扩写** — 根据场景设定生成标准提示词，AI 逐场景扩写
4. **日常事件库** — 预置过渡章节模板（集市偶遇、酒馆闲谈、修炼日常…）
5. **章节组装** — 勾选场景，排序，一键导出 TXT

### 🎨 文风系统

- **6 款预设文风**：玄幻华丽、武侠利落、现代吐槽、悬疑阴郁、温馨日常、史诗宏大
- **AI 文风提炼**：粘贴你喜欢的小说片段，AI 自动分析文风特征并生成提示词
- **自定义文风**：手动创建文风，设定关键词和写作要求
- **场景级切换**：不同场景可以使用不同文风

### 🔌 双格式 API 支持

- **OpenAI 格式**：`/v1/chat/completions`，SSE 流式响应
- **Anthropic 格式**：`/v1/messages`，`x-api-key` + `anthropic-version`，SSE 流式响应
- 多 API 配置，一键切换
- 支持自定义 Base URL（兼容各种 API 代理/中转）

### 📚 知识库

- 导入本地 `.md` 文件作为参考资料
- AI 写作时自动引用相关知识库内容
- 智能截断，避免超出上下文窗口

### 🤖 Agent HTTP 接口

- 启动本地 HTTP 服务（默认端口 6280）
- 供 Claude Code、Trae 等外部 Agent 调用
- 支持提示词生成、章节组合、日常模板等能力

---

## 快速开始

### 环境要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 10/11 |
| Node.js | 18.0+ |
| 浏览器 | Chrome 86+ / Edge 86+（需 File System Access API） |
| 磁盘空间 | 约 200MB（含 node_modules） |

### 方式一：下载轻量包

前往 [Releases](https://github.com/LESNine/InkRealm/releases) 下载最新版 zip，解压后执行：

```bash
npm install
npm run build
```

然后双击 `InkRealm.exe` 或运行 `npm start` 启动。

### 方式二：从源码构建

```bash
git clone https://github.com/LESNine/InkRealm.git
cd InkRealm

npm install
npm run build

# 启动（二选一）
npm start          # 命令行启动
InkRealm.exe       # 双击启动器（按 Q 停止服务）
```

启动后浏览器自动打开 http://localhost:5173

> 💡 开发模式可使用 `npm run dev` 启用热更新

---

## 使用流程

### 1. 配置 API

进入 **API 设置** 页面，添加你的 API 配置：

- 选择格式（OpenAI / Anthropic）
- 填入 Base URL（如 `https://api.openai.com` 或你的代理地址）
- 填入 API Key
- 填入模型名（如 `gpt-4o`、`claude-sonnet-4-20250514`）

### 2. 创建项目

- 在首页点击 **"选择文件夹"**，选择你的小说目录
- 如果文件夹中有 `大纲.md`，可以一键初始化项目
- 填写小说名、世界背景等信息

### 3. 拆解大纲

- 进入 **大纲** 页面，添加大事件
- 选中大事件，点击 **"AI 拆解"**，自动拆分为多个小事件
- 调整事件顺序和细节

### 4. 编辑场景

- 进入 **场景** 页面，查看所有场景
- 点击场景进入编辑器，配置：
  - 时间、地点、出场人物
  - 核心事件描述
  - 感官细节（视觉、听觉、嗅觉…）
  - 写作要求（节奏、视角、禁忌…）
- 选择文风，点击 **"生成提示词"**
- 点击 **"AI 生成"**，逐场景扩写

### 5. 组装导出

- 进入 **组装** 页面
- 勾选要包含的场景，调整顺序
- 点击 **"导出 TXT"**

---

## 项目结构

```
墨境/
├── InkRealm.exe              # 启动器（按 Q 停止服务）
├── start.bat                 # 启动脚本
├── server.js                 # 生产环境 HTTP 服务器
├── package.json              # 项目配置
├── index.html                # 入口 HTML
├── vite.config.ts            # Vite 构建配置
├── dist/                     # 构建输出
├── src/
│   ├── App.tsx               # 路由配置
│   ├── main.tsx              # 入口
│   ├── index.css             # 全局样式（东方水墨主题）
│   ├── components/
│   │   ├── Layout/           # 侧边栏 + 布局
│   │   └── Toast.tsx         # 全局通知
│   ├── pages/
│   │   ├── HomePage.tsx      # 项目管理
│   │   ├── OutlinePage.tsx   # 大纲拆解
│   │   ├── ScenesPage.tsx    # 场景列表
│   │   ├── SceneEditPage.tsx # 场景编辑器（核心）
│   │   ├── DailyPage.tsx     # 日常事件库
│   │   ├── KnowledgePage.tsx # 知识库管理
│   │   ├── AssemblePage.tsx  # 章节组装
│   │   ├── WritingStylePage.tsx # 文风管理
│   │   ├── SettingsPage.tsx  # API 设置
│   │   └── AgentSettingsPage.tsx # Agent 工具
│   ├── store/
│   │   └── useStore.ts       # Zustand 状态管理
│   ├── utils/
│   │   ├── aiService.ts      # AI API 调用（OpenAI + Anthropic）
│   │   ├── promptBuilder.ts  # 提示词构建
│   │   ├── fileSystem.ts     # 本地文件操作
│   │   ├── agentServer.ts    # Agent HTTP 服务
│   │   └── constants.ts      # 预设数据
│   └── types/
│       └── index.ts          # TypeScript 类型定义
└── REQUIREMENTS.md           # 环境需求说明
```

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 6 | 类型安全 |
| Vite | 8 | 构建工具 |
| Tailwind CSS | 4 | 样式（东方水墨主题） |
| Zustand | 5 | 状态管理 |
| React Router DOM | 7 | 路由（HashRouter） |
| Lucide React | - | 图标库 |

---

## 常见问题

### Q: 浏览器提示不支持 File System Access API

请使用 Chrome 86+ 或 Edge 86+ 浏览器。Firefox 和 Safari 暂不支持此 API。

### Q: 启动后浏览器没有自动打开

手动访问 http://localhost:5173

### Q: API 调用失败

检查 API 设置中的地址、密钥和模型是否正确。确保 API 服务可用。如果使用代理，确认 Base URL 以 `http://` 或 `https://` 开头。

### Q: 如何停止服务？

- 在 InkRealm.exe 窗口按 **Q** 键
- 或在 Web UI 侧边栏底部点击 **"关闭服务"** 按钮
- 或命令行运行 `InkRealm.exe --stop`

---

## 许可证

MIT License
