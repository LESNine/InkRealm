import { useState } from 'react';
import { Coffee, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DEFAULT_DAILY_TEMPLATES } from '../utils/constants';
import { buildDailyPrompt } from '../utils/promptBuilder';
import type { DailyEvent } from '../types';

export default function DailyPage() {
  const { currentProject, updateProject } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<DailyEvent>>({
    name: '',
    category: 'custom',
    description: '',
    template: '',
  });

  if (!currentProject) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">请先选择一个项目</p>
      </div>
    );
  }

  const allTemplates = [...DEFAULT_DAILY_TEMPLATES, ...currentProject.dailyEvents];

  const handleAdd = () => {
    if (!formData.name) return;

    const newEvent: DailyEvent = {
      id: `daily_${Date.now()}`,
      name: formData.name,
      category: (formData.category as DailyEvent['category']) || 'custom',
      description: formData.description || '',
      template: formData.template || '',
    };

    updateProject({
      ...currentProject,
      dailyEvents: [...currentProject.dailyEvents, newEvent],
      updatedAt: new Date().toISOString(),
    });

    setShowForm(false);
    setFormData({ name: '', category: 'custom', description: '', template: '' });
  };

  const handleDelete = (id: string) => {
    updateProject({
      ...currentProject,
      dailyEvents: currentProject.dailyEvents.filter((d) => d.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleInsert = (template: DailyEvent) => {
    const prompt = buildDailyPrompt(
      '刚刚经历了一场战斗',
      template,
      1500,
      '隐蔽的山洞'
    );

    // 创建一个新场景作为日常过渡
    const newScene = {
      id: `scene_${Date.now()}`,
      eventId: '',
      title: `日常：${template.name}`,
      time: '',
      location: '',
      characters: [],
      coreEvent: template.description,
      forbidden: '不要有任何新的冲突发生',
      wordCount: 1500,
      sensoryRequirements: [],
      knowledgeBaseRefs: [],
      prompt,
      content: '',
      status: 'draft' as const,
    };

    updateProject({
      ...currentProject,
      scenes: [...currentProject.scenes, newScene],
      updatedAt: new Date().toISOString(),
    });

    alert(`已创建日常场景：${template.name}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-800">日常事件库</h1>
          <p className="text-ink-500 mt-1">在大事件之间插入过渡章节，丰富故事节奏</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加模板
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTemplates.map((template) => {
          const isDefault = DEFAULT_DAILY_TEMPLATES.some((d) => d.id === template.id);
          return (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-ink-200 p-6 hover:shadow-lg hover:border-cinnabar/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-bamboo/10 rounded-lg flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-bamboo" />
                </div>
                {isDefault && (
                  <span className="px-2 py-0.5 bg-ink-100 text-ink-500 text-xs rounded-full">
                    内置
                  </span>
                )}
              </div>

              <h3 className="font-medium text-ink-800 mb-2">{template.name}</h3>
              <p className="text-sm text-ink-500 mb-4">{template.description}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleInsert(template)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  插入场景
                </button>
                {!isDefault && (
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-ink-400 hover:text-cinnabar transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allTemplates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-ink-200">
          <Coffee className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">暂无日常模板</p>
          <p className="text-sm text-ink-400 mt-1">
            点击上方按钮添加自定义模板
          </p>
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg">
            <h2 className="text-xl font-serif font-bold text-ink-800 mb-6">
              添加日常模板
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  模板名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：闭关修炼"
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as DailyEvent['category'] })
                  }
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                >
                  <option value="loot">战利品</option>
                  <option value="cultivation">修炼</option>
                  <option value="social">社交</option>
                  <option value="explore">探索</option>
                  <option value="custom">自定义</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="简短描述这个日常事件的内容..."
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  提示词模板
                </label>
                <textarea
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  rows={4}
                  placeholder={`使用占位符：{prevContext} 前情提要, {wordCount} 字数, {location} 地点\n例如：主角刚刚经历了{prevContext}。现在写一段{wordCount}字的日常过渡章节...`}
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-ink-200 rounded-lg text-ink-600 hover:bg-ink-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                disabled={!formData.name}
                className="flex-1 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors disabled:opacity-50"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
