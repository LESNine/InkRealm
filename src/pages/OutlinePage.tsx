import { useState } from 'react';
import { Plus, Trash2, Sparkles, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { OutlineEvent, SubEvent } from '../types';

export default function OutlinePage() {
  const { currentProject, updateProject } = useStore();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownInput, setBreakdownInput] = useState('');
  const [breakdownCount, setBreakdownCount] = useState(10);
  const [breakdownReqs, setBreakdownReqs] = useState('');
  const [generating, setGenerating] = useState(false);

  if (!currentProject) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">请先选择一个项目</p>
      </div>
    );
  }

  const handleAddEvent = () => {
    const newEvent: OutlineEvent = {
      id: `event_${Date.now()}`,
      name: '新事件',
      type: 'major',
      subEvents: [],
    };
    updateProject({
      ...currentProject,
      outline: [...currentProject.outline, newEvent],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    updateProject({
      ...currentProject,
      outline: currentProject.outline.filter((e) => e.id !== eventId),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<OutlineEvent>) => {
    updateProject({
      ...currentProject,
      outline: currentProject.outline.map((e) =>
        e.id === eventId ? { ...e, ...updates } : e
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddSubEvent = (eventId: string) => {
    const newSubEvent: SubEvent = {
      id: `sub_${Date.now()}`,
      name: '新子事件',
      type: 'plot',
    };
    updateProject({
      ...currentProject,
      outline: currentProject.outline.map((e) =>
        e.id === eventId
          ? { ...e, subEvents: [...e.subEvents, newSubEvent] }
          : e
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteSubEvent = (eventId: string, subEventId: string) => {
    updateProject({
      ...currentProject,
      outline: currentProject.outline.map((e) =>
        e.id === eventId
          ? { ...e, subEvents: e.subEvents.filter((s) => s.id !== subEventId) }
          : e
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleGenerateBreakdown = async () => {
    setGenerating(true);
    // 模拟AI拆解
    setTimeout(() => {
      const reqs = breakdownReqs.split(/[,，]/).filter(Boolean);
      const subEvents: SubEvent[] = Array.from({ length: breakdownCount }, (_, i) => ({
        id: `sub_${Date.now()}_${i}`,
        name: reqs[i] || `${breakdownInput} - 阶段${i + 1}`,
        type: i % 3 === 0 ? 'battle' : i % 3 === 1 ? 'plot' : 'daily',
        description: `${breakdownInput}的第${i + 1}个阶段`,
      }));

      const newEvent: OutlineEvent = {
        id: `event_${Date.now()}`,
        name: breakdownInput,
        type: 'major',
        subEvents,
      };

      updateProject({
        ...currentProject,
        outline: [...currentProject.outline, newEvent],
        updatedAt: new Date().toISOString(),
      });

      setGenerating(false);
      setShowBreakdown(false);
      setBreakdownInput('');
      setBreakdownReqs('');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-800">大纲管理</h1>
          <p className="text-ink-500 mt-1">拆解大事件，构建故事骨架</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBreakdown(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI拆解
          </button>
          <button
            onClick={handleAddEvent}
            className="flex items-center gap-2 px-4 py-2 bg-ink-800 text-white rounded-lg hover:bg-ink-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加事件
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {currentProject.outline.map((event, index) => (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {index < currentProject.outline.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-full bg-ink-200" />
            )}

            {/* Event Card */}
            <div className="bg-white rounded-xl border border-ink-200 p-6">
              <div className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="w-12 h-12 bg-cinnabar/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-cinnabar font-bold">{index + 1}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="text"
                      value={event.name}
                      onChange={(e) =>
                        handleUpdateEvent(event.id, { name: e.target.value })
                      }
                      className="text-lg font-medium text-ink-800 bg-transparent border-b border-transparent hover:border-ink-300 focus:border-cinnabar focus:outline-none transition-colors"
                    />
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        event.type === 'major'
                          ? 'bg-cinnabar/20 text-cinnabar'
                          : 'bg-bamboo/20 text-bamboo'
                      }`}
                    >
                      {event.type === 'major' ? '大事件' : '小事件'}
                    </span>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-1 text-ink-400 hover:text-cinnabar transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sub Events */}
                  <div className="space-y-2 ml-4">
                    {event.subEvents.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-3 p-3 bg-ink-50 rounded-lg"
                      >
                        <ChevronRight className="w-4 h-4 text-ink-400" />
                        <span className="text-sm text-ink-700">{sub.name}</span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            sub.type === 'battle'
                              ? 'bg-cinnabar/20 text-cinnabar'
                              : sub.type === 'plot'
                              ? 'bg-bamboo/20 text-bamboo'
                              : 'bg-gold/20 text-gold'
                          }`}
                        >
                          {sub.type === 'battle'
                            ? '战斗'
                            : sub.type === 'plot'
                            ? '剧情'
                            : '日常'}
                        </span>
                        <button
                          onClick={() => handleDeleteSubEvent(event.id, sub.id)}
                          className="ml-auto p-1 text-ink-400 hover:text-cinnabar transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddSubEvent(event.id)}
                      className="flex items-center gap-2 text-sm text-ink-500 hover:text-cinnabar transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      添加子事件
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {currentProject.outline.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-ink-200">
            <Sparkles className="w-12 h-12 text-ink-300 mx-auto mb-3" />
            <p className="text-ink-500">暂无事件</p>
            <p className="text-sm text-ink-400 mt-1">
              点击上方按钮添加事件或使用AI拆解
            </p>
          </div>
        )}
      </div>

      {/* Breakdown Dialog */}
      {showBreakdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg">
            <h2 className="text-xl font-serif font-bold text-ink-800 mb-4">
              AI拆解事件
            </h2>
            <p className="text-sm text-ink-500 mb-6">
              输入大事件描述，AI将自动拆解为多个小事件
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  事件描述
                </label>
                <textarea
                  value={breakdownInput}
                  onChange={(e) => setBreakdownInput(e.target.value)}
                  rows={3}
                  placeholder="例如：魔族入侵修仙界"
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  拆解数量
                </label>
                <input
                  type="number"
                  value={breakdownCount}
                  onChange={(e) => setBreakdownCount(Number(e.target.value))}
                  min={3}
                  max={20}
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  具体要求（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={breakdownReqs}
                  onChange={(e) => setBreakdownReqs(e.target.value)}
                  placeholder="例如：1次失败试探,1次内部叛变,3次局部战役"
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBreakdown(false)}
                className="flex-1 px-4 py-2 border border-ink-200 rounded-lg text-ink-600 hover:bg-ink-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleGenerateBreakdown}
                disabled={!breakdownInput || generating}
                className="flex-1 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors disabled:opacity-50"
              >
                {generating ? '拆解中...' : '开始拆解'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
