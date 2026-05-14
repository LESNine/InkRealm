import { useState } from 'react';
import { FolderOpen, BookOpen, FileText, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { scanDirectory, createProjectFromOutline } from '../utils/fileSystem';
import { showToast } from '../components/Toast';
import type { Project } from '../types';

export default function HomePage() {
  const { projects, setProjects, addProject, setCurrentProject } = useStore();
  const [showInitDialog, setShowInitDialog] = useState(false);
  const [initData, setInitData] = useState({
    name: '',
    worldBackground: '',
    dirHandle: null as FileSystemDirectoryHandle | null,
  });
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      const { projects: foundProjects, outlineDirs } = await scanDirectory();
      setProjects(foundProjects);

      if (outlineDirs.length > 0) {
        const first = outlineDirs[0];
        setInitData({
          name: first.outlineName.replace(/\.md$/i, ''),
          worldBackground: '',
          dirHandle: first.dirHandle,
        });
        setShowInitDialog(true);
      }
    } catch (error) {
      console.error('扫描失败:', error);
      showToast('error', '扫描失败：' + String(error));
    } finally {
      setScanning(false);
    }
  };

  const handleInitProject = async () => {
    if (!initData.dirHandle || !initData.name) return;

    try {
      const project = await createProjectFromOutline(
        initData.dirHandle,
        initData.name,
        initData.worldBackground
      );
      addProject(project);
      setShowInitDialog(false);
      setInitData({ name: '', worldBackground: '', dirHandle: null });
    } catch (error) {
      console.error('初始化项目失败:', error);
      showToast('error', '初始化失败：' + String(error));
    }
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-ink-800 mb-2">
          墨境 InkRealm
        </h1>
        <p className="text-ink-500">
          导演式AI辅助写作工具 —— 让AI做打字员，你做导演
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 px-6 py-3 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors disabled:opacity-50"
        >
          <FolderOpen className="w-5 h-5" />
          {scanning ? '扫描中...' : '扫描本地文件夹'}
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleOpenProject(project)}
              className="bg-white rounded-xl border border-ink-200 p-6 cursor-pointer hover:shadow-lg hover:border-cinnabar/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-ink-100 rounded-lg flex items-center justify-center group-hover:bg-cinnabar/10 transition-colors">
                  <BookOpen className="w-6 h-6 text-ink-600 group-hover:text-cinnabar" />
                </div>
                <span className="text-xs text-ink-400">
                  {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-ink-800 mb-2">
                {project.name}
              </h3>

              <p className="text-sm text-ink-500 line-clamp-2 mb-4">
                {project.description || '暂无简介'}
              </p>

              <div className="flex items-center gap-4 text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {project.scenes.length} 场景
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  {project.outline.length} 事件
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-ink-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ink-600 mb-2">
            暂无小说项目
          </h3>
          <p className="text-ink-400 mb-6">
            点击上方按钮扫描本地文件夹，或创建新项目
          </p>
        </div>
      )}

      {/* Init Dialog */}
      {showInitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-serif font-bold text-ink-800 mb-4">
              初始化小说项目
            </h2>
            <p className="text-sm text-ink-500 mb-6">
              检测到大纲文件，请补充项目信息
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  小说名称
                </label>
                <input
                  type="text"
                  value={initData.name}
                  onChange={(e) =>
                    setInitData({ ...initData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  世界背景
                </label>
                <textarea
                  value={initData.worldBackground}
                  onChange={(e) =>
                    setInitData({ ...initData, worldBackground: e.target.value })
                  }
                  rows={4}
                  placeholder="描述你的世界设定..."
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInitDialog(false)}
                className="flex-1 px-4 py-2 border border-ink-200 rounded-lg text-ink-600 hover:bg-ink-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleInitProject}
                disabled={!initData.name}
                className="flex-1 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors disabled:opacity-50"
              >
                创建项目
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
