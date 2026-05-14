import { useState } from 'react';
import { Plus, Trash2, Key, Globe, Bot } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { ApiConfig } from '../types';

export default function SettingsPage() {
  const { apiConfigs, addApiConfig, updateApiConfig, deleteApiConfig, setApiConfigs } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ApiConfig>>({
    name: '',
    format: 'openai',
    baseUrl: '',
    apiKey: '',
    model: '',
    isDefault: false,
  });

  const handleAdd = () => {
    setFormData({
      name: '',
      format: 'openai',
      baseUrl: '',
      apiKey: '',
      model: '',
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (config: ApiConfig) => {
    setFormData({ ...config });
    setEditingId(config.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.baseUrl || !formData.apiKey || !formData.model) return;

    const config: ApiConfig = {
      id: editingId || `api_${Date.now()}`,
      name: formData.name,
      format: formData.format as 'openai' | 'anthropic',
      baseUrl: formData.baseUrl,
      apiKey: formData.apiKey,
      model: formData.model,
      isDefault: formData.isDefault || false,
    };

    if (config.isDefault) {
      const updatedConfigs = apiConfigs.map((c) =>
        c.id !== config.id ? { ...c, isDefault: false } : c
      );
      setApiConfigs(updatedConfigs);
    }

    if (editingId) {
      updateApiConfig(config);
    } else {
      addApiConfig(config);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个API配置吗？')) {
      deleteApiConfig(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-800">API设置</h1>
          <p className="text-ink-500 mt-1">配置你的AI API，支持OpenAI和Anthropic格式</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-cinnabar text-white rounded-lg hover:bg-cinnabar-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加API
        </button>
      </div>

      {/* API List */}
      <div className="space-y-4">
        {apiConfigs.map((config) => (
          <div
            key={config.id}
            className="bg-white rounded-xl border border-ink-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium text-ink-800">{config.name}</h3>
                  {config.isDefault && (
                    <span className="px-2 py-0.5 bg-bamboo/20 text-bamboo text-xs rounded-full">
                      默认
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      config.format === 'openai'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-purple-50 text-purple-600'
                    }`}
                  >
                    {config.format === 'openai' ? 'OpenAI' : 'Anthropic'}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-ink-500">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{config.baseUrl}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span>{config.model}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    <span>{config.apiKey.slice(0, 8)}...{config.apiKey.slice(-4)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(config)}
                  className="p-2 text-ink-400 hover:text-cinnabar transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(config.id)}
                  className="p-2 text-ink-400 hover:text-cinnabar transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {apiConfigs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-ink-200">
            <Key className="w-12 h-12 text-ink-300 mx-auto mb-3" />
            <p className="text-ink-500">暂无API配置</p>
            <p className="text-sm text-ink-400 mt-1">点击上方按钮添加你的第一个API</p>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-serif font-bold text-ink-800 mb-6">
              {editingId ? '编辑API' : '添加API'}
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
                  placeholder="例如：OpenAI、Anthropic"
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  格式
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, format: 'openai' })}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      formData.format === 'openai'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    OpenAI
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, format: 'anthropic' })}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                      formData.format === 'anthropic'
                        ? 'bg-purple-50 border-purple-300 text-purple-700'
                        : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    Anthropic
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  API地址
                </label>
                <input
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  API密钥
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  模型
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="gpt-4、claude-sonnet-4-20250514"
                  className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cinnabar/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-cinnabar border-ink-300 rounded focus:ring-cinnabar"
                />
                <label htmlFor="isDefault" className="text-sm text-ink-700">
                  设为默认API
                </label>
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
