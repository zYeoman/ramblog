import { Memo, Tag } from '../types';
import { mockTags, mockMemos } from './mockData';

const MEMOS_STORAGE_KEY = 'ramblog-memos';
const TAGS_STORAGE_KEY = 'ramblog-tags';

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

// 从本地存储获取备忘录
export const getMemos = (): Memo[] => {
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

// 保存备忘录到本地存储
export const saveMemos = (memos: Memo[]): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(memos));
  } catch (error) {
    console.error('保存备忘录失败:', error);
  }
};

// 从本地存储获取标签
export const getTags = (): Tag[] => {
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

// 保存标签到本地存储
export const saveTags = (tags: Tag[]): void => {
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
export const addMemo = (memo: Memo): Memo[] => {
  const memos = getMemos();
  const updatedMemos = [memo, ...memos];
  saveMemos(updatedMemos);
  return updatedMemos;
};

// 删除备忘录
export const deleteMemo = (id: string): Memo[] => {
  const memos = getMemos();
  const updatedMemos = memos.filter(memo => memo.id !== id);
  saveMemos(updatedMemos);
  return updatedMemos;
};

// 添加新标签
export const addTag = (tag: Tag): Tag[] => {
  const tags = getTags();
  const updatedTags = [...tags, tag];
  saveTags(updatedTags);
  return updatedTags;
};

// 删除标签
export const deleteTag = (id: string): Tag[] => {
  const tags = getTags();
  const updatedTags = tags.filter(tag => tag.id !== id);
  saveTags(updatedTags);
  return updatedTags;
};

// 获取带有特定标签的备忘录
export const getMemosByTag = (tagId: string): Memo[] => {
  const memos = getMemos();
  return memos.filter(memo => memo.tags.includes(tagId));
};

// 编辑备忘录
export const editMemo = (id: string, content: string, tags: string[]): Memo[] => {
  const memos = getMemos();
  const updatedMemos = memos.map(memo => {
    if (memo.id === id) {
      return {
        ...memo,
        content,
        tags,
        updatedAt: new Date().toISOString()
      };
    }
    return memo;
  });
  saveMemos(updatedMemos);
  return updatedMemos;
};

// 置顶/取消置顶备忘录
export const togglePinMemo = (id: string): Memo[] => {
  const memos = getMemos();
  const updatedMemos = memos.map(memo => {
    if (memo.id === id) {
      return {
        ...memo,
        isPinned: !memo.isPinned,
        updatedAt: new Date().toISOString()
      };
    }
    return memo;
  });
  
  // 重新排序：置顶的排在前面
  const pinnedMemos = updatedMemos.filter(memo => memo.isPinned);
  const unpinnedMemos = updatedMemos.filter(memo => !memo.isPinned);
  const sortedMemos = [...pinnedMemos, ...unpinnedMemos];
  
  saveMemos(sortedMemos);
  return sortedMemos;
};

// 归档/取消归档备忘录
export const toggleArchiveMemo = (id: string): Memo[] => {
  const memos = getMemos();
  const updatedMemos = memos.map(memo => {
    if (memo.id === id) {
      return {
        ...memo,
        isArchived: !memo.isArchived,
        updatedAt: new Date().toISOString()
      };
    }
    return memo;
  });
  
  saveMemos(updatedMemos);
  return updatedMemos;
}; 