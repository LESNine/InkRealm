import { useState } from 'react';
import { Plus, PenTool, Trash2, Clock, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { Scene } from '../types';

export default function ScenesPage() {
  const navigate = useNavigate();
  const { currentProject, updateProject } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Scene>>({
    title: '',
    time: '',
    location: '',
    characters: [],
    coreEvent: '',
    wordCount: 2000,
  });

  if (!currentProject) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">请先选择一个项目</p>
      </div>
    );
  }

  const handleAdd = () => {
    if (!formData.title) return;

    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      eventId: '',
      title: formData.title,
      time: formData.time || '',
      location: formData.location || '',
      characters: formData.characters || [],
      coreEvent: formData.coreEvent || '',
      forbidden: '',
      wordCount: formData.wordCount || 2000,
      sensoryRequirements: [],
      knowledgeBaseRefs: [],
      prompt: '',
      content: '',
      status: 'draft',
    };

    updateProject({
      ...currentProject,
      scenes: [...currentProject.scenes, newScene],
      updatedAt: new Date().toISOString(),
    });

    setShowForm(false);
    setFormData({
      title: '',
      time: '',
      location: '',
      characters: [],
      coreEvent: '',
      wordCount: 2000,
    });
  };

  const handleDelete = (sceneId: string) => {
    updateProject({
      ...currentProject,
      scenes: currentProject.scenes.filter((s) => s.id !== sceneId),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleEdit = (sceneId: string) => {
    navigate(`/project/${currentProject.id}/scene/${sceneId}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-800">场景列表</h1>
          <p className="text-ink-500 mt-1">
            共 {currentProject.scenes.length} 个场景
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建场景
        </button>
      </div>

      {/* Scenes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProject.scenes.map((scene) => (
          <div
            key={scene.id}
            className="bg-white rounded-xl border border-ink-200 p-6 hover:shadow-lg hover:border-cinnabar/30 transition-all group cursor-pointer"
            onClick={() => handleEdit(scene.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-cinnabar/10 rounded-lg flex items-center justify-center">
                <PenTool className="w-5 h-5 text-cinnabar" />
              </div>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  scene.status === 'completed'
                    ? 'bg-bamboo/20 text-bamboo'
                    : 'bg-gold/20 text-gold'
                }`}
              >
                {scene.status === 'completed' ? '已完成' : '草稿'}
              </span>
            </div>

            <h3 className="font-medium text-ink-800 mb-2">{scene.title}</h3>

            <div className="space-y-2 text-sm text-ink-500 mb-4">
              {scene.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{scene.time}</span>
                </div>
              )}
              {scene.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{scene.location}</span>
                </div>
              )}
              {scene.characters.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{scene.characters.join('、')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-400">
                {scene.wordCount} 字
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(scene.id);
                }}
                className="p-1 text-ink-400 hover:text-cinnabar transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {currentProject.scenes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-ink-200">
          <PenTool className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">暂无场景</p>
          <p className="text-sm text-ink-400 mt-1">
            点击上方按钮创建你的第一个场景
          </p>
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg">
            <h2 className="text-xl font-serif font-bold text-ink-800 mb-6">
              新建场景
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  场景标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：黑松林遇袭"
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
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="黄昏"
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    地点
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="黑松林"
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
                  value={formData.characters?.join('、')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      characters: e.target.value.split(/[,，]/).filter(Boolean),
                    })
                  }
                  placeholder="主角、山贼甲、山贼乙"
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  核心事件
                </label>
                <textarea
                  value={formData.coreEvent}
                  onChange={(e) => setFormData({ ...formData, coreEvent: e.target.value })}
                  rows={3}
                  placeholder="描述这个场景的核心事件..."
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  目标字数
                </label>
                <input
                  type="number"
                  value={formData.wordCount}
                  onChange={(e) =>
                    setFormData({ ...formData, wordCount: Number(e.target.value) })
                  }
                  min={500}
                  max={10000}
                  step={100}
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
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
                disabled={!formData.title}
                className="flex-1 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors disabled:opacity-50"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
