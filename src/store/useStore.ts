import { create } from 'zustand';
import type { Project, ApiConfig, AgentServerStatus, WritingStyle } from '../types';
import { PRESET_WRITING_STYLES } from '../utils/constants';

interface AppState {
  projects: Project[];
  currentProject: Project | null;
  apiConfigs: ApiConfig[];
  currentApiId: string | null;
  sidebarCollapsed: boolean;
  agentServer: AgentServerStatus;
  writingStyles: WritingStyle[];
  currentStyleId: string | null;
  bypassFilter: boolean;

  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;

  setApiConfigs: (configs: ApiConfig[]) => void;
  addApiConfig: (config: ApiConfig) => void;
  updateApiConfig: (config: ApiConfig) => void;
  deleteApiConfig: (id: string) => void;
  setCurrentApiId: (id: string | null) => void;

  setSidebarCollapsed: (collapsed: boolean) => void;

  setAgentServer: (status: AgentServerStatus) => void;
  addAgentLog: (log: AgentServerStatus['logs'][0]) => void;

  setWritingStyles: (styles: WritingStyle[]) => void;
  addWritingStyle: (style: WritingStyle) => void;
  updateWritingStyle: (style: WritingStyle) => void;
  deleteWritingStyle: (id: string) => void;
  setCurrentStyleId: (id: string | null) => void;

  setBypassFilter: (enabled: boolean) => void;
}

const loadApiConfigs = (): ApiConfig[] => {
  try {
    const stored = localStorage.getItem('inkrealm_apis');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveApiConfigs = (configs: ApiConfig[]) => {
  localStorage.setItem('inkrealm_apis', JSON.stringify(configs));
};

const loadWritingStyles = (): WritingStyle[] => {
  try {
    const stored = localStorage.getItem('inkrealm_styles');
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return PRESET_WRITING_STYLES.map((s) => ({ ...s }));
};

const saveWritingStyles = (styles: WritingStyle[]) => {
  localStorage.setItem('inkrealm_styles', JSON.stringify(styles));
};

const loadBypassFilter = (): boolean => {
  try {
    const stored = localStorage.getItem('inkrealm_bypass');
    return stored ? JSON.parse(stored) : false;
  } catch {
    return false;
  }
};

const saveBypassFilter = (enabled: boolean) => {
  localStorage.setItem('inkrealm_bypass', JSON.stringify(enabled));
};

export const useStore = create<AppState>((set, get) => ({
  projects: [],
  currentProject: null,
  apiConfigs: loadApiConfigs(),
  currentApiId: null,
  sidebarCollapsed: false,
  agentServer: {
    running: false,
    port: 6280,
    logs: [],
  },
  writingStyles: loadWritingStyles(),
  currentStyleId: null,
  bypassFilter: loadBypassFilter(),

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
      currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
    })),

  setApiConfigs: (configs) => {
    saveApiConfigs(configs);
    set({ apiConfigs: configs });
  },
  addApiConfig: (config) => {
    const configs = [...get().apiConfigs, config];
    saveApiConfigs(configs);
    set({ apiConfigs: configs });
  },
  updateApiConfig: (config) => {
    const configs = get().apiConfigs.map((c) => (c.id === config.id ? config : c));
    saveApiConfigs(configs);
    set({ apiConfigs: configs });
  },
  deleteApiConfig: (id) => {
    const configs = get().apiConfigs.filter((c) => c.id !== id);
    saveApiConfigs(configs);
    set({ apiConfigs: configs });
  },
  setCurrentApiId: (id) => set({ currentApiId: id }),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setAgentServer: (status) => set({ agentServer: status }),
  addAgentLog: (log) =>
    set((state) => ({
      agentServer: {
        ...state.agentServer,
        logs: [log, ...state.agentServer.logs].slice(0, 100),
      },
    })),

  setWritingStyles: (styles) => {
    saveWritingStyles(styles);
    set({ writingStyles: styles });
  },
  addWritingStyle: (style) => {
    const styles = [...get().writingStyles, style];
    saveWritingStyles(styles);
    set({ writingStyles: styles });
  },
  updateWritingStyle: (style) => {
    const styles = get().writingStyles.map((s) => (s.id === style.id ? style : s));
    saveWritingStyles(styles);
    set({ writingStyles: styles });
  },
  deleteWritingStyle: (id) => {
    const styles = get().writingStyles.filter((s) => s.id !== id);
    saveWritingStyles(styles);
    set({ writingStyles: styles, currentStyleId: get().currentStyleId === id ? null : get().currentStyleId });
  },
  setCurrentStyleId: (id) => set({ currentStyleId: id }),

  setBypassFilter: (enabled) => {
    saveBypassFilter(enabled);
    set({ bypassFilter: enabled });
  },
}));
