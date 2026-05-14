import { useState } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Wand2,
  BookOpen,
  Tag,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { sendChatMessage } from '../utils/aiService';
import { STYLE_ANALYSIS_PROMPT } from '../utils/constants';
import { showToast } from '../components/Toast';
import type { WritingStyle } from '../types';

interface AnalysisResult {
  keywords: string[];
  analysis: string;
  prompt: string;
}

export default function WritingStylePage() {
  const {
    writingStyles,
    addWritingStyle,
    updateWritingStyle,
    deleteWritingStyle,
    currentStyleId,
    setCurrentStyleId,
    apiConfigs,
  } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WritingStyle>>({
    name: '',
    description: '',
    keywords: [],
    prompt: '',
  });
  const [keywordInput, setKeywordInput] = useState('');

  const [analysisText, setAnalysisText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const defaultApi = apiConfigs.find((a) => a.isDefault) || apiConfigs[0];

  const presetStyles = writingStyles.filter((s) => s.isPreset);
  const customStyles = writingStyles.filter((s) => !s.isPreset);

  const handleAdd = () => {
    setFormData({ name: '', description: '', keywords: [], prompt: '' });
    setKeywordInput('');
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (style: WritingStyle) => {
    setFormData({ ...style });
    setKeywordInput(style.keywords.join('、'));
    setEditingId(style.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.prompt) return;

    const keywords = keywordInput
      .split(/[,，、]/)
      .map((k) => k.trim())
      .filter(Boolean);

    const style: WritingStyle = {
      id: editingId || `style_${Date.now()}`,
      name: formData.name,
      description: formData.description || '',
      isPreset: false,
      keywords,
      prompt: formData.prompt,
    };

    if (editingId) {
      updateWritingStyle(style);
    } else {
      addWritingStyle(style);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, isPreset: boolean) => {
    if (isPreset) {
      showToast('error', '预设文风不可删除');
      return;
    }
    if (confirm('确定要删除这个文风吗？')) {
      deleteWritingStyle(id);
    }
  };

  const handleSelect = (id: string) => {
    setCurrentStyleId(currentStyleId === id ? null : id);
  };

  const handleAnalyze = async () => {
    if (!analysisText.trim() || !defaultApi) {
      showToast('error', defaultApi ? '请输入小说片段' : '请先配置API');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await sendChatMessage(
        defaultApi,
        [
          {
            role: 'system',
            content:
              '你是一位文学分析专家，擅长分析小说文风特征。请严格按照用户要求的JSON格式返回结果，不要添加任何其他文字。',
          },
          {
            role: 'user',
            content: `${STYLE_ANALYSIS_PROMPT}\n\n小说片段：\n${analysisText.slice(0, 8000)}`,
          },
        ],
        undefined
      );

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: AnalysisResult = JSON.parse(jsonMatch[0]);
        setAnalysisResult(parsed);
        showToast('success', '文风分析完成');
      } else {
        throw new Error('返回格式不正确');
      }
    } catch (error) {
      console.error('分析失败:', error);
      showToast('error', '文风分析失败：' + String(error));
    } finally {
      setAnalyzing(false);
    }
  };

  const applyAnalysis = () => {
    if (!analysisResult) return;
    setFormData({
      name: '',
      description: analysisResult.analysis.slice(0, 100),
      keywords: analysisResult.keywords,
      prompt: analysisResult.prompt,
    });
    setKeywordInput(analysisResult.keywords.join('、'));
    setEditingId(null);
    setShowForm(true);
  };

  const renderStyleCard = (style: WritingStyle) => {
    const isSelected = currentStyleId === style.id;
    const isExpanded = expandedId === style.id;

    return (
      <div
        key={style.id}
        className={`bg-white rounded-xl border p-6 transition-all ${
          isSelected
            ? 'border-cinnabar shadow-md ring-1 ring-cinnabar/20'
            : 'border-ink-200 hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium text-ink-800">{style.name}</h3>
              {style.isPreset && (
                <span className="px-2 py-0.5 bg-bamboo/20 text-bamboo text-xs rounded-full">
                  预设
                </span>
              )}
              {isSelected && (
                <span className="px-2 py-0.5 bg-cinnabar/20 text-cinnabar text-xs rounded-full">
                  当前选中
                </span>
              )}
            </div>
            <p className="text-sm text-ink-500 mb-3">{style.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {style.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 bg-ink-100 text-ink-600 text-xs rounded-full"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => handleSelect(style.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isSelected
                  ? 'bg-cinnabar text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {isSelected ? '已选中' : '选用'}
            </button>
            <button
              onClick={() => handleEdit(style)}
              className="p-2 text-ink-400 hover:text-cinnabar transition-colors"
            >
              编辑
            </button>
            <button
              onClick={() => handleDelete(style.id, style.isPreset)}
              className="p-2 text-ink-400 hover:text-cinnabar transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setExpandedId(isExpanded ? null : style.id)}
          className="flex items-center gap-1 text-sm text-ink-400 hover:text-ink-600 mt-2 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" /> 收起提示词
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> 查看提示词
            </>
          )}
        </button>

        {isExpanded && (
          <div className="mt-3 p-3 bg-ink-800 rounded-lg">
            <pre className="text-sm text-ink-200 font-mono whitespace-pre-wrap">
              {style.prompt}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-800">文风管理</h1>
          <p className="text-ink-500 mt-1">选择或自定义文风，让AI按你的风格写作</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加文风
        </button>
      </div>

      {/* Style Analysis Section */}
      <div className="bg-white rounded-xl border border-ink-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-bamboo" />
          <h2 className="font-medium text-ink-800">文风提炼</h2>
        </div>
        <p className="text-sm text-ink-500 mb-4">
          粘贴你喜欢的小说片段（2000字以内效果最佳），AI会自动分析其文风特征并生成对应的文风提示词。
        </p>
        <textarea
          value={analysisText}
          onChange={(e) => setAnalysisText(e.target.value)}
          rows={5}
          placeholder="粘贴小说片段 here..."
          className="w-full px-4 py-3 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50 resize-none text-ink-700 leading-relaxed mb-4"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-400">
            {analysisText.length} 字
          </span>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !analysisText.trim() || !defaultApi}
            className="flex items-center gap-2 px-4 py-2 bg-bamboo text-white rounded-lg hover:bg-bamboo-light transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                提炼文风
              </>
            )}
          </button>
        </div>

        {analysisResult && (
          <div className="mt-6 p-4 bg-ink-50 rounded-lg border border-ink-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-ink-800">分析结果</h3>
              <button
                onClick={applyAnalysis}
                className="flex items-center gap-1 text-sm text-cinnabar hover:text-cinnabar-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加为自定义文风
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {analysisResult.keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 bg-bamboo/20 text-bamboo text-xs rounded-full"
                >
                  {kw}
                </span>
              ))}
            </div>
            <p className="text-sm text-ink-600 mb-3">{analysisResult.analysis}</p>
            <div className="p-3 bg-ink-800 rounded-lg">
              <pre className="text-sm text-ink-200 font-mono whitespace-pre-wrap">
                {analysisResult.prompt}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Preset Styles */}
      {presetStyles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-ink-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-bamboo" />
            预设文风
          </h2>
          <div className="space-y-4">
            {presetStyles.map(renderStyleCard)}
          </div>
        </div>
      )}

      {/* Custom Styles */}
      {customStyles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-ink-800 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-cinnabar" />
            自定义文风
          </h2>
          <div className="space-y-4">
            {customStyles.map(renderStyleCard)}
          </div>
        </div>
      )}

      {writingStyles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-ink-200">
          <FileText className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">暂无文风配置</p>
          <p className="text-sm text-ink-400 mt-1">使用上方"文风提炼"功能或手动添加</p>
        </div>
      )}

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-serif font-bold text-ink-800 mb-6">
              {editingId ? '编辑文风' : '添加文风'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：热血燃情"
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  描述
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="简短描述这个文风的特点..."
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  关键词（用逗号或顿号分隔）
                </label>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="辞藻华丽、气势磅礴、古韵悠长"
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  文风提示词
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  rows={6}
                  placeholder="描述这种文风的具体写作要求，AI会根据这段提示词调整输出风格..."
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
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
