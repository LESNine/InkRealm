import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  BookOpen,
  List,
  PenTool,
  Coffee,
  Library,
  Puzzle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Bot,
  Feather,
  Power,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const menuItems = [
  { path: '/', icon: Home, label: '项目首页' },
  { path: '/project/:projectId/outline', icon: List, label: '大纲管理' },
  { path: '/project/:projectId/scenes', icon: PenTool, label: '场景编辑器' },
  { path: '/project/:projectId/daily', icon: Coffee, label: '日常库' },
  { path: '/project/:projectId/knowledge', icon: Library, label: '知识库' },
  { path: '/project/:projectId/assemble', icon: Puzzle, label: '章节组装' },
];

const bottomItems = [
  { path: '/settings/style', icon: Feather, label: '文风管理' },
  { path: '/settings/api', icon: Settings, label: 'API设置' },
  { path: '/settings/agent', icon: Bot, label: 'Agent工具' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed, currentProject } = useStore();
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const res = await fetch('/_inkrealm/health', { signal: controller.signal });
        clearTimeout(timeout);
        setServerOnline(res.ok);
      } catch {
        setServerOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleShutdown = async () => {
    if (!confirm('确定要关闭墨境服务吗？关闭后需要重新运行启动脚本才能再次使用。')) return;
    try {
      await fetch('/_inkrealm/shutdown', { method: 'POST' });
    } catch {
      // expected to fail after server shuts down
    }
    setServerOnline(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.includes(':projectId')) {
      if (!currentProject) return false;
      const basePath = path.replace(':projectId', currentProject.id);
      return location.pathname.startsWith(basePath);
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    if (path.includes(':projectId')) {
      if (!currentProject) return;
      navigate(path.replace(':projectId', currentProject.id));
    } else {
      navigate(path);
    }
  };

  return (
    <aside
      className={`h-screen bg-ink-800 text-ink-100 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-ink-700">
        <BookOpen className="w-6 h-6 text-cinnabar flex-shrink-0" />
        {!sidebarCollapsed && (
          <span className="ml-3 font-serif text-lg font-bold text-paper">
            墨境
          </span>
        )}
      </div>

      {/* Main Menu */}
      <nav className="flex-1 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              disabled={item.path.includes(':projectId') && !currentProject}
              className={`w-full flex items-center px-4 py-3 transition-colors ${
                active
                  ? 'bg-cinnabar/20 text-cinnabar-light border-r-2 border-cinnabar'
                  : 'text-ink-300 hover:bg-ink-700 hover:text-paper'
              } ${
                item.path.includes(':projectId') && !currentProject
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="ml-3 text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="py-4 border-t border-ink-700 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center px-4 py-3 transition-colors ${
                active
                  ? 'bg-cinnabar/20 text-cinnabar-light border-r-2 border-cinnabar'
                  : 'text-ink-300 hover:bg-ink-700 hover:text-paper'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="ml-3 text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Server Status & Shutdown */}
      <div className="border-t border-ink-700 py-2 px-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-green-400' : 'bg-ink-500'}`}
          />
          {!sidebarCollapsed && (
            <span className="text-xs text-ink-400">
              {serverOnline ? '服务运行中' : '服务已离线'}
            </span>
          )}
        </div>
        {serverOnline && (
          <button
            onClick={handleShutdown}
            className={`flex items-center text-ink-400 hover:text-cinnabar transition-colors ${
              sidebarCollapsed ? 'justify-center w-full' : 'gap-2'
            }`}
            title="关闭服务"
          >
            <Power className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-xs">关闭服务</span>}
          </button>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="h-10 flex items-center justify-center border-t border-ink-700 text-ink-400 hover:text-paper hover:bg-ink-700 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
