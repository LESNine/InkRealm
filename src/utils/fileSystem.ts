import type { Project } from '../types';
import { OUTLINE_MD_NAMES } from './constants';

export async function scanDirectory(): Promise<{ projects: Project[]; outlineDirs: { dirHandle: FileSystemDirectoryHandle; outlineName: string }[] }> {
  const dirHandle = await window.showDirectoryPicker();
  const projects: Project[] = [];
  const outlineDirs: { dirHandle: FileSystemDirectoryHandle; outlineName: string }[] = [];

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'directory') {
      try {
        const subDir = entry as FileSystemDirectoryHandle;
        const project = await detectProject(subDir);
        if (project) {
          projects.push(project);
        } else {
          const outlineName = await detectOutlineMd(subDir);
          if (outlineName) {
            outlineDirs.push({ dirHandle: subDir, outlineName });
          }
        }
      } catch {
        // 忽略无法访问的目录
      }
    }
  }

  return { projects, outlineDirs };
}

async function detectProject(dirHandle: FileSystemDirectoryHandle): Promise<Project | null> {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.json')) {
      try {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const content = await file.text();
        const data = JSON.parse(content);
        if (data.id && data.name && data.scenes !== undefined) {
          return data as Project;
        }
      } catch {
        // 不是有效的项目文件
      }
    }
  }
  return null;
}

async function detectOutlineMd(dirHandle: FileSystemDirectoryHandle): Promise<string | null> {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const name = entry.name.toLowerCase();
      for (const outlineName of OUTLINE_MD_NAMES) {
        if (name === outlineName.toLowerCase()) {
          return entry.name;
        }
      }
    }
  }
  return null;
}

export async function readProjectFile(dirHandle: FileSystemDirectoryHandle): Promise<Project | null> {
  return detectProject(dirHandle);
}

export async function writeProjectFile(
  dirHandle: FileSystemDirectoryHandle,
  project: Project
): Promise<void> {
  const fileName = `.${project.name}.json`;
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(project, null, 2));
  await writable.close();
}

export async function createProjectFromOutline(
  dirHandle: FileSystemDirectoryHandle,
  name: string,
  worldBackground: string
): Promise<Project> {
  const now = new Date().toISOString();
  const project: Project = {
    id: `proj_${Date.now()}`,
    name,
    description: '',
    worldBackground,
    createdAt: now,
    updatedAt: now,
    outline: [],
    scenes: [],
    dailyEvents: [],
    knowledgeBase: [],
    settings: {
      defaultApiId: '',
      defaultStyleId: '',
    },
  };

  await writeProjectFile(dirHandle, project);
  return project;
}

export async function readMdFile(dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<string> {
  const fileHandle = await dirHandle.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  return file.text();
}

export async function writeTextFile(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string,
  content: string
): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
