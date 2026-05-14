import { useState } from 'react';
import { Play, Square, Terminal, Copy, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { startAgentServer, stopAgentServer } from '../utils/agentServer';

export default function AgentSettingsPage() {
  const { agentServer, setAgentServer } = useStore();
  const [copied, setCopied] = useState(false);

  const handleStart = async () => {
    try {
      await startAgentServer(agentServer.port);
      setAgentServer({ ...agentServer, running: true });
    } catch (error) {
      console.error('启动失败:', error);
    }
  };

  const handleStop = async () => {
    try {
      await stopAgentServer();
      setAgentServer({ ...agentServer, running: false });
    } catch (error) {
      console.error('停止失败:', error);
    }
  };

  const copyCurlExample = () => {
    const example = `curl -X POST http://localhost:${agentServer.port}/api/v1/tools/assemble \\
  -H "Content-Type: application/json" \\
  -d '{
    "files": ["./chapters/ch1.md", "./chapters/ch2.md"],
    "output": "./output/novel.txt"
  }'`;
    navigator.clipboard.writeText(example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tools = [
    {
      name: 'assemble',
      description: '将多个Markdown章节文件按顺序合并为TXT文件',
      method: 'POST',
      path: '/api/v1/tools/assemble',
    },
    {
      name: 'prompt',
      description: '根据场景参数生成标准AI扩写提示词',
      method: 'POST',
      path: '/api/v1/tools/prompt',
    },
    {
      name: 'daily',
      description: '获取日常事件模板列表或特定模板',
      method: 'POST',
      path: '/api/v1/tools/daily',
    },
    {
      name: 'knowledge',
      description: '根据关键词搜索知识库内容',
      method: 'POST',
      path: '/api/v1/tools/knowledge',
    },
    {
      name: 'outline',
      description: '将大事件拆解为小事件列表',
      method: 'POST',
      path: '/api/v1/tools/outline',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-ink-800">Agent工具</h1>
        <p className="text-ink-500 mt-1">
          启动本地HTTP服务，供Claude Code、Trae等外部Agent调用
        </p>
      </div>

      {/* Server Status */}
      <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-3 h-3 rounded-full ${
                agentServer.running ? 'bg-bamboo' : 'bg-ink-300'
              }`}
            />
            <div>
              <h3 className="font-medium text-ink-800">
                {agentServer.running ? '服务运行中' : '服务已停止'}
              </h3>
              <p className="text-sm text-ink-500">
                {agentServer.running
                  ? `http://localhost:${agentServer.port}`
                  : '点击启动按钮开启服务'}
              </p>
            </div>
          </div>
          <button
            onClick={agentServer.running ? handleStop : handleStart}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
              agentServer.running
                ? 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                : 'bg-bamboo text-white hover:bg-bamboo-light'
            }`}
          >
            {agentServer.running ? (
              <>
                <Square className="w-4 h-4" />
                停止服务
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                启动服务
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Start */}
      {agentServer.running && (
        <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-ink-800">快速开始</h3>
            <button
              onClick={copyCurlExample}
              className="flex items-center gap-1 text-sm text-cinnabar hover:text-cinnabar-dark transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制示例
                </>
              )}
            </button>
          </div>
          <div className="bg-ink-800 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-ink-200 font-mono">
              <span className="text-cinnabar-light">curl</span> -X POST http://localhost:
              {agentServer.port}/api/v1/tools/assemble <span className="text-bamboo-light">\</span>
              <br />
              &nbsp;&nbsp;-H <span className="text-gold">"Content-Type: application/json"</span>{' '}
              <span className="text-bamboo-light">\</span>
              <br />
              &nbsp;&nbsp;-d <span className="text-gold">&apos;{`{"files": ["./chapters/ch1.md", "./chapters/ch2.md"], "output": "./output/novel.txt"}`}&apos;</span>
            </code>
          </div>
        </div>
      )}

      {/* Tools List */}
      <div className="bg-white rounded-xl border border-ink-200 p-6 mb-6">
        <h3 className="font-medium text-ink-800 mb-4">可用能力</h3>
        <div className="space-y-3">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-4 p-3 bg-ink-50 rounded-lg"
            >
              <Terminal className="w-5 h-5 text-bamboo flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink-800">{tool.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-bamboo/20 text-bamboo rounded">
                    {tool.method}
                  </span>
                </div>
                <p className="text-sm text-ink-500">{tool.description}</p>
                <code className="text-xs text-ink-400">{tool.path}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl border border-ink-200 p-6">
        <h3 className="font-medium text-ink-800 mb-4">调用日志</h3>
        {agentServer.logs.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-auto">
            {agentServer.logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 text-sm p-2 bg-ink-50 rounded"
              >
                <span className="text-ink-400 text-xs">
                  {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-xs ${
                    log.status >= 200 && log.status < 300
                      ? 'bg-bamboo/20 text-bamboo'
                      : 'bg-cinnabar/20 text-cinnabar'
                  }`}
                >
                  {log.status}
                </span>
                <span className="text-ink-600">{log.method}</span>
                <span className="text-ink-500">{log.path}</span>
                <span className="text-ink-400 text-xs">{log.duration}ms</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-ink-400 py-8">暂无调用记录</p>
        )}
      </div>
    </div>
  );
}
