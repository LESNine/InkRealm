# 墨境 InkRealm - 环境需求

## 系统要求

- **操作系统**: Windows 10/11
- **Node.js**: 18.0 或更高版本
- **浏览器**: Chrome 86+ / Edge 86+（需要支持 File System Access API）
- **磁盘空间**: 约 200MB（含 node_modules）

## 安装步骤

### 方式一：一键启动（推荐）

1. 确保已安装 Node.js 18+（下载地址：https://nodejs.org/）
2. 双击 `InkRealm.exe` 或 `启动墨境.bat`
3. 首次运行会自动安装依赖并构建项目
4. 浏览器会自动打开 http://localhost:5173

### 方式二：手动启动

1. 确保已安装 Node.js 18+
2. 打开命令行，进入项目目录
3. 运行以下命令：

```bash
# 安装依赖
npm install

# 开发模式（热更新）
npm run dev

# 或构建后运行
npm run build
npm start
```

4. 在浏览器中打开 http://localhost:5173

## 功能说明

### 核心功能
- **项目管理**: 扫描本地文件夹，自动识别小说项目
- **大纲拆解**: 将大事件拆解为多个小事件/战役
- **场景编辑器**: 配置场景设定，生成标准提示词，AI扩写
- **日常事件库**: 预置过渡章节模板
- **知识库**: 导入Markdown文件，AI写作时自动引用
- **章节组装**: 选择场景组装成完整章节，导出TXT

### Agent工具接口
- 启动本地HTTP服务（默认端口6280）
- 供Claude Code、Trae等外部Agent调用
- 支持章节组合、提示词生成、日常模板等能力

### API配置
- 支持OpenAI格式和Anthropic格式
- 可配置多个API，一键切换
- 支持流式响应

## 项目结构

```
墨境/
├── InkRealm.exe          # 一键启动器
├── 启动墨境.bat           # 中文启动脚本
├── start.bat             # 英文启动脚本
├── server.js             # 生产环境HTTP服务器
├── package.json          # 项目配置
├── dist/                 # 构建输出（运行后生成）
├── src/                  # 源代码
│   ├── components/       # UI组件
│   ├── pages/            # 页面
│   ├── utils/            # 工具函数
│   ├── store/            # 状态管理
│   └── types/            # 类型定义
└── .trae/documents/      # 产品文档
```

## 常见问题

### Q: 浏览器提示不支持 File System Access API
A: 请使用 Chrome 86+ 或 Edge 86+ 浏览器。Firefox 和 Safari 暂不支持此API。

### Q: 启动后浏览器没有自动打开
A: 请手动访问 http://localhost:5173

### Q: API调用失败
A: 请检查API设置中的地址、密钥和模型是否正确。确保API服务可用。

### Q: Agent服务无法启动
A: Agent服务使用Node.js的http模块，需要通过Node.js运行。确保端口6280未被占用。

## 技术栈

- React 18 + TypeScript
- Vite 8
- Tailwind CSS 4
- Zustand 5
- React Router DOM 7
- Lucide React
