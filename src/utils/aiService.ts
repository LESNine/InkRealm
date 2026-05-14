import type { ApiConfig } from '../types';

export async function sendChatMessage(
  apiConfig: ApiConfig,
  messages: { role: string; content: string }[],
  onStream?: (chunk: string) => void
): Promise<string> {
  if (apiConfig.format === 'openai') {
    return sendOpenAIRequest(apiConfig, messages, onStream);
  } else {
    return sendAnthropicRequest(apiConfig, messages, onStream);
  }
}

async function sendOpenAIRequest(
  apiConfig: ApiConfig,
  messages: { role: string; content: string }[],
  onStream?: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: apiConfig.model,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取响应流');

  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
            onStream?.(content);
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }

  return fullContent;
}

async function sendAnthropicRequest(
  apiConfig: ApiConfig,
  messages: { role: string; content: string }[],
  onStream?: (chunk: string) => void
): Promise<string> {
  const systemMessage = messages.find((m) => m.role === 'system');
  const userMessages = messages.filter((m) => m.role !== 'system');

  const response = await fetch(`${apiConfig.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiConfig.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: apiConfig.model,
      max_tokens: 4096,
      system: systemMessage?.content,
      messages: userMessages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取响应流');

  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta') {
            const content = parsed.delta?.text;
            if (content) {
              fullContent += content;
              onStream?.(content);
            }
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }

  return fullContent;
}
