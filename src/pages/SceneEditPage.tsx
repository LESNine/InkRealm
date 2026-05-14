import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Copy, CheckCircle, Sparkles, Eye, EyeOff, Feather } from 'lucide-react';
import { useStore } from '../store/useStore';
import { buildScenePrompt } from '../utils/promptBuilder';
import { sendChatMessage } from '../utils/aiService';
import { SENSORY_OPTIONS, JAILBREAK_SYSTEM_PROMPT } from '../utils/constants';
import { showToast } from '../components/Toast';
import type { Scene } from '../types';

export default function SceneEditPage() {
  const { sceneId } = useParams<{ sceneId: string }>();
  const { currentProject, updateProject, apiConfigs, writingStyles, currentStyleId, setCurrentStyleId, bypassFilter } = useStore();
  const [scene, setScene] = useState<Scene | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const styleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentProject && sceneId) {
      const found = currentProject.scenes.find((s) => s.id === sceneId);
      if (found) {
        setScene(found);
        setGeneratedContent(found.content || '');
      }
    }
  }, [currentProject, sceneId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
        setShowStyleSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentProject || !scene) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">场景不存在</p>
      </div>
    );
  }

  const defaultApi = apiConfigs.find((a) => a.isDefault) || apiConfigs[0];

  const handleUpdateScene = (updates: Partial<Scene>) => {
    const updated = { ...scene, ...updates };
    setScene(updated);
    updateProject({
      ...currentProject,
      scenes: currentProject.scenes.map((s) => (s.id === scene.id ? updated : s)),
      updatedAt: new Date().toISOString(),
    });
  };

  const selectedStyle = writingStyles.find((s) => s.id === currentStyleId);

  const handleGeneratePrompt = () => {
    const prompt = buildScenePrompt(scene, currentProject.knowledgeBase, selectedStyle);
    handleUpdateScene({ prompt });
  };

  const handleGenerate = async () => {
    if (!defaultApi || !scene.prompt) return;

    setGenerating(true);
    setGeneratedContent('');

    try {
      const systemContent = bypassFilter
        ? JAILBREAK_SYSTEM_PROMPT
        : '你是一位资深网络小说作家，擅长写细节丰富、感官描写到位的场景。请严格按照用户的要求写作，不要跳过任何细节。';

      const content = await sendChatMessage(
        defaultApi,
        [
          {
            role: 'system',
            content: systemContent,
          },
          { role: 'user', content: scene.prompt },
        ],
        (chunk) => {
          setGeneratedContent((prev) => prev + chunk);
        }
      );

      handleUpdateScene({ content, status: 'completed' });
      showToast('success', 'AI扩写完成');
    } catch (error) {
      console.error('生成失败:', error);
      showToast('error', 'AI扩写失败：' + String(error));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(scene.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSensory = (id: string) => {
    const reqs = scene.sensoryRequirements.includes(id)
      ? scene.sensoryRequirements.filter((s) => s !== id)
      : [...scene.sensoryRequirements, id];
    handleUpdateScene({ sensoryRequirements: reqs });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-800">
            {scene.title}
          </h1>
          <p className="text-ink-500 mt-1">
            {scene.time} · {scene.location}
            {selectedStyle && (
              <span className="ml-2 px-2 py-0.5 bg-bamboo/20 text-bamboo text-xs rounded-full">
                {selectedStyle.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
           <div className="relative" ref={styleDropdownRef}>
             <button
               onClick={() => setShowStyleSelector(!showStyleSelector)}
               className="flex items-center gap-2 px-4 py-2 border border-ink-200 rounded-lg text-ink-600 hover:bg-ink-50 transition-colors"
             >
               <Feather className="w-4 h-4" />
               {selectedStyle ? selectedStyle.name : '选择文风'}
             </button>
             {showStyleSelector && (
               <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-ink-200 shadow-lg z-20 py-2">
                 <button
                   onClick={() => { setCurrentStyleId(null); setShowStyleSelector(false); }}
                   className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                     !currentStyleId ? 'bg-cinnabar/10 text-cinnabar' : 'text-ink-600 hover:bg-ink-50'
                   }`}
                 >
                   默认（无特定文风）
                 </button>
                 {writingStyles.map((style) => (
                   <button
                     key={style.id}
                     onClick={() => { setCurrentStyleId(style.id); setShowStyleSelector(false); }}
                     className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                       currentStyleId === style.id ? 'bg-cinnabar/10 text-cinnabar' : 'text-ink-600 hover:bg-ink-50'
                     }`}
                   >
                     <div className="font-medium">{style.name}</div>
                     <div className="text-xs text-ink-400">{style.description}</div>
                   </button>
                 ))}
               </div>
             )}
           </div>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="flex items-center gap-2 px-4 py-2 border border-ink-200 rounded-lg text-ink-600 hover:bg-ink-50 transition-colors"
          >
            {showPrompt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPrompt ? '隐藏提示词' : '显示提示词'}
          </button>
          <button
            onClick={handleGeneratePrompt}
            className="flex items-center gap-2 px-4 py-2 bg-bamboo text-white rounded-lg hover:bg-bamboo-light transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            生成提示词
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Scene Settings */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-ink-200 p-6">
            <h3 className="font-medium text-ink-800 mb-4">场景设定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  value={scene.title}
                  onChange={(e) => handleUpdateScene({ title: e.target.value })}
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    时间
                  </label>
                  <input
                    type="text"
                    value={scene.time}
                    onChange={(e) => handleUpdateScene({ time: e.target.value })}
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    地点
                  </label>
                  <input
                    type="text"
                    value={scene.location}
                    onChange={(e) => handleUpdateScene({ location: e.target.value })}
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  人物（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={scene.characters.join('、')}
                  onChange={(e) =>
                    handleUpdateScene({
                      characters: e.target.value.split(/[,，]/).filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  核心事件
                </label>
                <textarea
                  value={scene.coreEvent}
                  onChange={(e) => handleUpdateScene({ coreEvent: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  禁止内容
                </label>
                <textarea
                  value={scene.forbidden}
                  onChange={(e) => handleUpdateScene({ forbidden: e.target.value })}
                  rows={2}
                  placeholder="AI绝对不要写的内容..."
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  目标字数
                </label>
                <input
                  type="number"
                  value={scene.wordCount}
                  onChange={(e) =>
                    handleUpdateScene({ wordCount: Number(e.target.value) })
                  }
                  min={500}
                  max={10000}
                  step={100}
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>
            </div>
          </div>

          {/* Sensory Requirements */}
          <div className="bg-white rounded-xl border border-ink-200 p-6">
            <h3 className="font-medium text-ink-800 mb-4">感官描写要求</h3>
            <div className="space-y-2">
              {SENSORY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleSensory(option.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    scene.sensoryRequirements.includes(option.id)
                      ? 'bg-cinnabar/10 border-cinnabar/30 text-cinnabar'
                      : 'bg-ink-50 border-ink-200 text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      scene.sensoryRequirements.includes(option.id)
                        ? 'bg-cinnabar border-cinnabar'
                        : 'border-ink-300'
                    }`}
                  >
                    {scene.sensoryRequirements.includes(option.id) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-ink-400">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Prompt & Result */}
        <div className="space-y-6">
          {/* Prompt Preview */}
          {showPrompt && (
            <div className="bg-white rounded-xl border border-ink-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-ink-800">提示词预览</h3>
                <button
                  onClick={handleCopyPrompt}
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
                      复制
                    </>
                  )}
                </button>
              </div>
              <div className="bg-ink-800 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-ink-200 font-mono whitespace-pre-wrap">
                  {scene.prompt || '点击"生成提示词"按钮生成...'}
                </pre>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !scene.prompt || !defaultApi}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {generating ? '生成中...' : '调用AI扩写'}
          </button>

          {!defaultApi && (
            <p className="text-sm text-cinnabar text-center">
              请先配置API
            </p>
          )}

          {/* Generated Content */}
          {generatedContent && (
            <div className="bg-white rounded-xl border border-ink-200 p-6">
              <h3 className="font-medium text-ink-800 mb-4">生成结果</h3>
              <textarea
                value={generatedContent}
                onChange={(e) => {
                  setGeneratedContent(e.target.value);
                  handleUpdateScene({ content: e.target.value });
                }}
                rows={20}
                className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50 resize-none text-ink-700 leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
