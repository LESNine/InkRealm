import { useState } from 'react';
import { Download, CheckSquare, Square, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AssemblePage() {
  const { currentProject } = useStore();
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [chapterTitle, setChapterTitle] = useState('');
  const [addNumbers, setAddNumbers] = useState(true);
  const [addSeparator, setAddSeparator] = useState(false);

  if (!currentProject) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">请先选择一个项目</p>
      </div>
    );
  }

  const completedScenes = currentProject.scenes.filter(
    (s) => s.status === 'completed' && s.content
  );

  const toggleScene = (id: string) => {
    setSelectedScenes((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...selectedScenes];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setSelectedScenes(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === selectedScenes.length - 1) return;
    const newOrder = [...selectedScenes];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSelectedScenes(newOrder);
  };

  const handleExport = () => {
    const selected = selectedScenes
      .map((id) => completedScenes.find((s) => s.id === id))
      .filter(Boolean);

    let content = '';
    if (chapterTitle) {
      content += `${chapterTitle}\n\n`;
    }

    selected.forEach((scene, index) => {
      if (addNumbers) {
        content += `第${index + 1}节 ${scene!.title}\n\n`;
      }
      content += scene!.content;
      if (addSeparator && index < selected.length - 1) {
        content += '\n\n==========\n\n';
      } else if (index < selected.length - 1) {
        content += '\n\n';
      }
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chapterTitle || '章节'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedSceneObjects = selectedScenes
    .map((id) => completedScenes.find((s) => s.id === id))
    .filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-800">章节组装</h1>
          <p className="text-ink-500 mt-1">选择场景，组装成完整章节并导出</p>
        </div>
        <button
          onClick={handleExport}
          disabled={selectedScenes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          导出TXT
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scene Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-ink-200 p-6">
            <h3 className="font-medium text-ink-800 mb-4">
              选择场景 ({completedScenes.length} 个可用)
            </h3>
            <div className="space-y-2">
              {completedScenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => toggleScene(scene.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    selectedScenes.includes(scene.id)
                      ? 'bg-cinnabar/10 border-cinnabar/30'
                      : 'bg-ink-50 border-ink-200 hover:bg-ink-100'
                  }`}
                >
                  {selectedScenes.includes(scene.id) ? (
                    <CheckSquare className="w-5 h-5 text-cinnabar" />
                  ) : (
                    <Square className="w-5 h-5 text-ink-400" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-ink-800">
                      {scene.title}
                    </div>
                    <div className="text-xs text-ink-500">
                      {scene.time} · {scene.location} · {scene.content.length} 字
                    </div>
                  </div>
                </button>
              ))}

              {completedScenes.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                  <p className="text-sm text-ink-500">暂无已完成的场景</p>
                  <p className="text-xs text-ink-400 mt-1">
                    先在场景编辑器中生成内容
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assembly Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-ink-200 p-6">
            <h3 className="font-medium text-ink-800 mb-4">组装预览</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  章节标题
                </label>
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="例如：第1章 觉醒"
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-ink-600">
                  <input
                    type="checkbox"
                    checked={addNumbers}
                    onChange={(e) => setAddNumbers(e.target.checked)}
                    className="w-4 h-4 text-cinnabar border-ink-300 rounded focus:ring-cinnabar"
                  />
                  添加节编号
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-600">
                  <input
                    type="checkbox"
                    checked={addSeparator}
                    onChange={(e) => setAddSeparator(e.target.checked)}
                    className="w-4 h-4 text-cinnabar border-ink-300 rounded focus:ring-cinnabar"
                  />
                  添加分隔线
                </label>
              </div>
            </div>

            {/* Selected Scenes Order */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-ink-700 mb-2">
                已选场景顺序 ({selectedSceneObjects.length} 个)
              </h4>
              {selectedSceneObjects.map((scene, index) => (
                <div
                  key={scene!.id}
                  className="flex items-center gap-2 p-3 bg-ink-50 rounded-lg"
                >
                  <span className="w-6 h-6 bg-cinnabar/20 text-cinnabar rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm text-ink-700">
                    {scene!.title}
                  </span>
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-ink-400 hover:text-cinnabar transition-colors disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === selectedSceneObjects.length - 1}
                    className="p-1 text-ink-400 hover:text-cinnabar transition-colors disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {selectedSceneObjects.length === 0 && (
                <p className="text-center text-ink-400 py-4">
                  从左侧选择要组装的场景
                </p>
              )}
            </div>

            {/* Stats */}
            {selectedSceneObjects.length > 0 && (
              <div className="mt-4 p-3 bg-bamboo/10 rounded-lg">
                <div className="text-sm text-bamboo">
                  总字数：
                  {selectedSceneObjects.reduce(
                    (sum, s) => sum + (s?.content.length || 0),
                    0
                  )}{' '}
                  字
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
