import { useState } from 'react';
import { Upload, FileText, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { KnowledgeFile } from '../types';

export default function KnowledgePage() {
  const { currentProject, updateProject } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  if (!currentProject) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">请先选择一个项目</p>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: KnowledgeFile[] = [];

    for (const file of files) {
      if (file.name.endsWith('.md')) {
        const content = await file.text();
        newFiles.push({
          id: `kb_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: file.name,
          path: file.name,
          content,
        });
      }
    }

    if (newFiles.length > 0) {
      updateProject({
        ...currentProject,
        knowledgeBase: [...currentProject.knowledgeBase, ...newFiles],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleDelete = (id: string) => {
    updateProject({
      ...currentProject,
      knowledgeBase: currentProject.knowledgeBase.filter((k) => k.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    const newFiles: KnowledgeFile[] = [];

    for (const file of files) {
      if (file.name.endsWith('.md')) {
        const content = await file.text();
        newFiles.push({
          id: `kb_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: file.name,
          path: file.name,
          content,
        });
      }
    }

    if (newFiles.length > 0) {
      updateProject({
        ...currentProject,
        knowledgeBase: [...currentProject.knowledgeBase, ...newFiles],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-800">知识库</h1>
          <p className="text-ink-500 mt-1">
            导入Markdown文件，AI写作时自动引用相关内容
          </p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          导入文件
          <input
            type="file"
            accept=".md"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`mb-6 p-8 border-2 border-dashed rounded-xl text-center transition-colors ${
          dragOver
            ? 'border-cinnabar bg-cinnabar/5'
            : 'border-ink-200 bg-white hover:border-ink-300'
        }`}
      >
        <FileText className="w-10 h-10 text-ink-300 mx-auto mb-3" />
        <p className="text-ink-500">
          拖拽Markdown文件到此处，或点击上方按钮导入
        </p>
        <p className="text-sm text-ink-400 mt-1">
          支持 .md 文件，如世界观.md、功法体系.md等
        </p>
      </div>

      {/* File List */}
      <div className="space-y-3">
        {currentProject.knowledgeBase.map((file) => (
          <div
            key={file.id}
            className="bg-white rounded-xl border border-ink-200 overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-ink-50 transition-colors"
              onClick={() =>
                setExpandedId(expandedId === file.id ? null : file.id)
              }
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-bamboo" />
                <span className="font-medium text-ink-800">{file.name}</span>
                <span className="text-xs text-ink-400">
                  {file.content.length} 字符
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
                  }}
                  className="p-1 text-ink-400 hover:text-cinnabar transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expandedId === file.id ? (
                  <ChevronDown className="w-4 h-4 text-ink-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-ink-400" />
                )}
              </div>
            </div>

            {expandedId === file.id && (
              <div className="px-4 pb-4">
                <div className="bg-ink-50 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-sm text-ink-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {file.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {currentProject.knowledgeBase.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-ink-200">
          <FileText className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">暂无知识库文件</p>
          <p className="text-sm text-ink-400 mt-1">
            导入Markdown文件，AI写作时会自动引用
          </p>
        </div>
      )}
    </div>
  );
}
