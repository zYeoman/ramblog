import { Memo, Tag } from '../types';
import { mockTags, mockMemos } from './mockData';
import { ConfigManager } from './configManager';

const MEMOS_STORAGE_KEY = 'ramblog-memos';
const TAGS_STORAGE_KEY = 'ramblog-tags';

// 获取配置
const getConfig = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return ConfigManager.getInstance().getConfig();
};

export const apiUpload = async (endpoint: string, data?: any) => {
  const config = getConfig();
  if (!config || !config.api.enabled) {
    throw new Error('API未启用');
  }

  const url = `${config.api.baseUrl}${endpoint}`;
  return await fetch(url, {
    method: 'POST',
    body: data,
  });
};

// API请求函数
const apiRequest = async (endpoint: string, method: string = 'GET', data?: any) => {
  const config = getConfig();

  if (!config || !config.api.enabled) {
    throw new Error('API未启用');
  }

  const url = `${config.api.baseUrl}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  // 对于DELETE请求，可能没有返回内容
  if (method === 'DELETE') {
    return null;
  }

  return await response.json();
};

// 初始化存储
export const initializeStorage = (force: boolean = false): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // 检查是否需要初始化备忘录
    const storedMemos = localStorage.getItem(MEMOS_STORAGE_KEY);
    if (!storedMemos || force) {
      localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(mockMemos));
      console.log('备忘录数据已初始化');
    }

    // 检查是否需要初始化标签
    const storedTags = localStorage.getItem(TAGS_STORAGE_KEY);
    if (!storedTags || force) {
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(mockTags));
      console.log('标签数据已初始化');
    }
  } catch (error) {
    console.error('初始化存储失败:', error);
    // 尝试清理并重新初始化
    try {
      localStorage.removeItem(MEMOS_STORAGE_KEY);
      localStorage.removeItem(TAGS_STORAGE_KEY);
      localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(mockMemos));
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(mockTags));
    } catch (e) {
      console.error('重新初始化存储失败:', e);
    }
  }
};

// 从本地存储或API获取备忘录
export const getMemos = async (): Promise<Memo[]> => {
  const config = getConfig();

  // 如果API启用，从API获取数据
  if (config?.api.enabled) {
    try {
      const memos = await apiRequest(config.api.endpoints.memos);
      return memos;
    } catch (error) {
      console.error('从API获取备忘录失败:', error);
      // 如果API失败，回退到本地存储
    }
  }

  // 从本地存储获取
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedMemos = localStorage.getItem(MEMOS_STORAGE_KEY);
    return storedMemos ? JSON.parse(storedMemos) : mockMemos;
  } catch (error) {
    console.error('获取备忘录失败:', error);
    return mockMemos;
  }
};

// 保存备忘录到本地存储或API
export const saveMemos = async (memos: Memo[]): Promise<void> => {
  const config = getConfig();

  // 如果API启用，不进行本地存储（因为数据来自API）
  if (config?.api.enabled) {
    return;
  }

  // 保存到本地存储
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(memos));
  } catch (error) {
    console.error('保存备忘录失败:', error);
  }
};

// 从本地存储或API获取标签
export const getTags = async (): Promise<Tag[]> => {
  const config = getConfig();

  // 如果API启用，从API获取数据
  if (config?.api.enabled) {
    try {
      const tags = await apiRequest(config.api.endpoints.tags);
      // 将API返回的标签字符串数组转换为Tag对象数组
      if (Array.isArray(tags) && typeof tags[0] === 'string') {
        return tags.map((tagName, index) => ({
          id: `tag-${index + 1}`,
          name: tagName,
          color: getRandomColor(),
        }));
      }
      return tags;
    } catch (error) {
      console.error('从API获取标签失败:', error);
      // 如果API失败，回退到本地存储
    }
  }

  // 从本地存储获取
  if (typeof window === 'undefined') {
    return mockTags;
  }

  try {
    const storedTags = localStorage.getItem(TAGS_STORAGE_KEY);
    return storedTags ? JSON.parse(storedTags) : mockTags;
  } catch (error) {
    console.error('获取标签失败:', error);
    return mockTags;
  }
};

// 生成随机颜色
const getRandomColor = (): string => {
  const colors = [
    '#3b82f6',
    '#10b981',
    '#ef4444',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#14b8a6',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 保存标签到本地存储
export const saveTags = async (tags: Tag[]): Promise<void> => {
  const config = getConfig();

  // 如果API启用，不进行本地存储（因为数据来自API）
  if (config?.api.enabled) {
    return;
  }

  // 保存到本地存储
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  } catch (error) {
    console.error('保存标签失败:', error);
  }
};

// 添加新的备忘录
export const addMemo = async (memo: Memo): Promise<Memo[]> => {
  const config = getConfig();

  // 如果API启用，通过API添加
  if (config?.api.enabled) {
    try {
      await apiRequest(config.api.endpoints.memos, 'POST', memo);
      // 重新获取最新的备忘录列表
      return await getMemos();
    } catch (error) {
      console.error('通过API添加备忘录失败:', error);
      throw error;
    }
  }

  // 本地添加
  const memos = await getMemos();
  const updatedMemos = [memo, ...memos];
  await saveMemos(updatedMemos);
  return updatedMemos;
};

// 删除备忘录
export const deleteMemo = async (id: string): Promise<Memo[]> => {
  const config = getConfig();

  // 如果API启用，通过API删除
  if (config?.api.enabled) {
    try {
      await apiRequest(`${config.api.endpoints.memos}/${id}`, 'DELETE');
      // 重新获取最新的备忘录列表
      return await getMemos();
    } catch (error) {
      console.error('通过API删除备忘录失败:', error);
      throw error;
    }
  }

  // 本地删除
  const memos = await getMemos();
  const updatedMemos = memos.filter((memo) => memo.id !== id);
  await saveMemos(updatedMemos);
  return updatedMemos;
};

// 添加新标签
export const addTag = async (tag: Tag): Promise<Tag[]> => {
  // 目前API不支持添加单个标签，所以只进行本地操作
  const tags = await getTags();
  const updatedTags = [...tags, tag];
  await saveTags(updatedTags);
  return updatedTags;
};

// 删除标签
export const deleteTag = async (id: string): Promise<Tag[]> => {
  // 目前API不支持删除单个标签，所以只进行本地操作
  const tags = await getTags();
  const updatedTags = tags.filter((tag) => tag.id !== id);
  await saveTags(updatedTags);
  return updatedTags;
};

// 获取带有特定标签的备忘录
export const getMemosByTag = async (tagId: string): Promise<Memo[]> => {
  const memos = await getMemos();
  return memos.filter((memo) => memo.tags.includes(tagId));
};

// 编辑备忘录
export const editMemo = async (id: string, content: string, tags: string[]): Promise<Memo[]> => {
  const config = getConfig();

  // 如果API启用，通过API更新
  if (config?.api.enabled) {
    try {
      // 先获取当前备忘录
      const memos = await getMemos();
      const currentMemo = memos.find((memo) => memo.id === id);

      if (currentMemo) {
        const updatedMemo = {
          ...currentMemo,
          content,
          tags,
          updatedAt: new Date().toISOString(),
        };

        await apiRequest(`${config.api.endpoints.memos}/${id}`, 'PUT', updatedMemo);
        // 重新获取最新的备忘录列表
        return await getMemos();
      }
      throw new Error('备忘录不存在');
    } catch (error) {
      console.error('通过API更新备忘录失败:', error);
      throw error;
    }
  }

  // 本地更新
  const memos = await getMemos();
  const updatedMemos = memos.map((memo) => {
    if (memo.id === id) {
      return {
        ...memo,
        content,
        tags,
        updatedAt: new Date().toISOString(),
      };
    }
    return memo;
  });
  await saveMemos(updatedMemos);
  return updatedMemos;
};

// 置顶/取消置顶备忘录
export const togglePinMemo = async (id: string): Promise<Memo[]> => {
  // API可能不支持置顶功能，所以只在本地处理
  const memos = await getMemos();
  const updatedMemos = memos.map((memo) => {
    if (memo.id === id) {
      return {
        ...memo,
        isPinned: !memo.isPinned,
        updatedAt: new Date().toISOString(),
      };
    }
    return memo;
  });

  // 重新排序：置顶的排在前面
  const pinnedMemos = updatedMemos.filter((memo) => memo.isPinned);
  const unpinnedMemos = updatedMemos.filter((memo) => !memo.isPinned);
  const sortedMemos = [...pinnedMemos, ...unpinnedMemos];

  await saveMemos(sortedMemos);
  return sortedMemos;
};

// 归档/取消归档备忘录
export const toggleArchiveMemo = async (id: string): Promise<Memo[]> => {
  // API可能不支持归档功能，所以只在本地处理
  const memos = await getMemos();
  const updatedMemos = memos.map((memo) => {
    if (memo.id === id) {
      return {
        ...memo,
        isArchived: !memo.isArchived,
        updatedAt: new Date().toISOString(),
      };
    }
    return memo;
  });

  await saveMemos(updatedMemos);
  return updatedMemos;
};
