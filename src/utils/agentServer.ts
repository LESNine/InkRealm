import { AGENT_SERVER_PORT } from './constants';
import { buildScenePrompt } from './promptBuilder';
import { DEFAULT_DAILY_TEMPLATES } from './constants';
import type { Scene, AgentLog } from '../types';

let serverInstance: unknown = null;
let serverRunning = false;

export async function startAgentServer(
  port: number = AGENT_SERVER_PORT,
  onLog?: (log: AgentLog) => void
): Promise<void> {
  if (serverRunning) {
    throw new Error('Agent服务已经在运行');
  }

  const { createServer } = await import('node:http');

  const httpServer = createServer(async (req: any, res: any) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    const parsedBody = body ? JSON.parse(body) : {};
    const url = (req.url || '/').split('?')[0];
    const method = req.method || 'GET';

    let result: { status: number; data: unknown };

    try {
      if (method === 'GET' && url === '/api/v1/tools') {
        result = { status: 200, data: getToolsManifest() };
      } else if (method === 'POST' && url === '/api/v1/tools/assemble') {
        result = { status: 200, data: handleAssemble(parsedBody) };
      } else if (method === 'POST' && url === '/api/v1/tools/prompt') {
        result = { status: 200, data: handlePrompt(parsedBody, onLog) };
      } else if (method === 'POST' && url === '/api/v1/tools/daily') {
        result = { status: 200, data: handleDaily(parsedBody) };
      } else if (method === 'POST' && url === '/api/v1/tools/knowledge') {
        result = { status: 200, data: handleKnowledge(parsedBody) };
      } else if (method === 'POST' && url === '/api/v1/tools/outline') {
        result = { status: 200, data: handleOutline(parsedBody) };
      } else {
        result = { status: 404, data: { error: 'Not Found' } };
      }
    } catch (error) {
      result = { status: 400, data: { error: String(error) } };
    }

    res.writeHead(result.status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result.data));
  });

  return new Promise((resolve, reject) => {
    httpServer.on('error', reject);
    httpServer.listen(port, () => {
      serverRunning = true;
      serverInstance = httpServer;
      resolve();
    });
  });
}

export async function stopAgentServer(): Promise<void> {
  if (!serverInstance || !serverRunning) {
    throw new Error('Agent服务未运行');
  }
  const server = serverInstance as any;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  serverInstance = null;
  serverRunning = false;
}

export function isAgentServerRunning(): boolean {
  return serverRunning;
}

function getToolsManifest() {
  return {
    tools: [
      {
        name: 'assemble',
        description: '将多个Markdown章节文件按顺序合并为TXT文件',
        parameters: { files: ['章节路径数组'], output: '输出文件路径' },
      },
      {
        name: 'prompt',
        description: '根据场景参数生成标准AI扩写提示词',
        parameters: { scene: { title: '', time: '', location: '', characters: [], coreEvent: '', wordCount: 2000 } },
      },
      {
        name: 'daily',
        description: '获取日常事件模板列表或特定模板',
        parameters: { action: 'list | get', templateId: '模板ID' },
      },
      {
        name: 'knowledge',
        description: '根据关键词搜索知识库内容',
        parameters: { query: '搜索关键词', maxResults: 3 },
      },
      {
        name: 'outline',
        description: '将大事件拆解为小事件列表',
        parameters: { event: '事件描述', count: 10 },
      },
    ],
  };
}

function handleAssemble(body: Record<string, any>) {
  const { files, output } = body;
  return {
    success: true,
    output,
    stats: { totalChapters: (files as string[])?.length || 0 },
  };
}

function handlePrompt(body: Record<string, any>, onLog?: (log: AgentLog) => void) {
  const { scene, knowledgeBase = [] } = body;

  const fullScene: Scene = {
    id: 'temp',
    eventId: '',
    title: scene?.title || '',
    time: scene?.time || '',
    location: scene?.location || '',
    characters: scene?.characters || [],
    coreEvent: scene?.coreEvent || '',
    forbidden: scene?.forbidden || '',
    wordCount: scene?.wordCount || 2000,
    sensoryRequirements: scene?.sensoryRequirements || [],
    knowledgeBaseRefs: [],
    prompt: '',
    content: '',
    status: 'draft',
  };

  const kbFiles = (knowledgeBase as string[]).map((name: string, i: number) => ({
    id: `kb_${i}`,
    name,
    path: name,
    content: '',
  }));

  const prompt = buildScenePrompt(fullScene, kbFiles);

  onLog?.({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    method: 'POST',
    path: '/api/v1/tools/prompt',
    status: 200,
    duration: 0,
  });

  return { success: true, prompt, wordCount: fullScene.wordCount };
}

function handleDaily(body: Record<string, any>) {
  const { action, templateId, customize = {} } = body;

  if (action === 'list') {
    return {
      templates: DEFAULT_DAILY_TEMPLATES.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
      })),
    };
  }

  const template = DEFAULT_DAILY_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    return { error: '模板不存在' };
  }

  return {
    template,
    prompt: `主角刚刚经历了${customize.prevContext || '一场战斗'}。现在写一段${customize.wordCount || 1500}字的日常过渡章节。内容是：${template.description}。氛围要轻松惬意，不要有任何新的冲突发生。`,
  };
}

function handleKnowledge(body: Record<string, any>) {
  const { query } = body;
  return {
    query,
    results: [{ source: '知识库', content: `关于"${query}"的相关内容...`, relevance: 0.95 }],
  };
}

function handleOutline(body: Record<string, any>) {
  const { event, eventType, count } = body;

  const subEvents = Array.from({ length: count }, (_, i) => ({
    id: `sub_${String(i + 1).padStart(3, '0')}`,
    name: `${event} - 阶段${i + 1}`,
    type: i % 3 === 0 ? 'battle' : i % 3 === 1 ? 'plot' : 'daily',
    description: `${eventType}的第${i + 1}个阶段`,
  }));

  return { success: true, subEvents };
}
