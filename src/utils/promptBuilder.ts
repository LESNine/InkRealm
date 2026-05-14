import type { Scene, KnowledgeFile, DailyEvent, WritingStyle } from '../types';

export function buildScenePrompt(
  scene: Scene,
  knowledgeBase: KnowledgeFile[],
  style?: WritingStyle | null
): string {
  const sensoryMap: Record<string, string> = {
    visual: '每个新场景的前两段，必须包含视觉描写（如光影、色彩、形态）',
    auditory: '必须包含听觉描写（如风声、脚步声、对话语气）',
    olfactory: '必须包含嗅觉描写（如血腥味、花香、泥土气息）',
    tactile: '必须包含触觉描写（如温度、质地、疼痛感）',
    gustatory: '必须包含味觉描写（如食物味道、血腥味）',
  };

  const sensoryReqs = scene.sensoryRequirements
    .map((s) => sensoryMap[s] || s)
    .join('\n');

  const kbContent = scene.knowledgeBaseRefs
    .map((ref) => {
      const kb = knowledgeBase.find((k) => k.name === ref);
      if (!kb) return '';
      const truncated = truncateAtSentence(kb.content, 2000);
      return `--- ${ref} ---\n${truncated}`;
    })
    .filter(Boolean)
    .join('\n\n');

  let prompt = `你是一位网络小说写手，我是导演。我会给你场景设定，你只负责把这个场景写出来，不要推进剧情，不要写后续发展。

写一个场景，字数${scene.wordCount}字左右。

场景设定：
- 时间：${scene.time}
- 地点：${scene.location}
- 人物：${scene.characters.join('、')}
- 核心事件：${scene.coreEvent}

写作要求：
1. ${sensoryReqs || '环境五感：每个新场景的前两段，必须包含视觉、听觉、嗅觉的描写'}
2. 对话时，必须描写人物的肢体语言和微表情（如捏紧拳头、眼神闪烁、冷笑），不要只写干巴巴的台词
3. 主角每次做决定前，必须有心理活动，分析利弊或吐槽
4. 如果是战斗，不要只写"主角出了一剑"，要描写灵力的运转、周围气流的改变、武器的破空声、对手的惊骇表情
5. 不要赶进度！不要跳过任何细节！不要用"经过一番激战"这种概括性语言，要一招一式地写
6. 字数必须达到${scene.wordCount}字，如果不够就增加环境描写、心理活动、对话细节`;

  if (scene.forbidden) {
    prompt += `\n7. 绝对不要写以下内容：${scene.forbidden}`;
  }

  if (style) {
    prompt += `\n\n--- 文风要求 ---\n${style.prompt}`;
  }

  if (kbContent) {
    prompt += `\n\n--- 参考资料 ---\n${kbContent}`;
  }

  return prompt;
}

function truncateAtSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastPeriod = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('！'),
    truncated.lastIndexOf('？'),
    truncated.lastIndexOf('\n')
  );
  if (lastPeriod > maxLen * 0.5) {
    return truncated.slice(0, lastPeriod + 1);
  }
  return truncated;
}

export function buildOutlinePrompt(
  eventDesc: string,
  eventType: string,
  count: number,
  requirements: string[]
): string {
  return `我要写一场${eventDesc}。请将这场${eventType}拆分为${count}个具体的小事件/战役，要求包含：${requirements.join('、')}。请给出每个小事件的名称和简述，按时间顺序排列。`;
}

export function buildDailyPrompt(
  prevContext: string,
  dailyEvent: DailyEvent,
  wordCount: number,
  location: string = '隐蔽的山洞'
): string {
  let template = dailyEvent.template;
  template = template.replace(/{wordCount}/g, String(wordCount));
  template = template.replace(/{location}/g, location);
  template = template.replace(/{prevContext}/g, prevContext);

  return template;
}
