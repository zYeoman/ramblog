import { Memo, Tag } from '../types';
import { subDays } from 'date-fns';

// 模拟标签数据
export const mockTags: Tag[] = [
  { id: '1', name: '工作', color: '#ff6b6b' },
  { id: '2', name: '学习', color: '#51cf66' },
  { id: '3', name: '生活', color: '#339af0' },
  { id: '4', name: '想法', color: '#fcc419' },
  { id: '5', name: '待办', color: '#9775fa' }
];

// 生成过去90天的随机备忘录数据
export const generateMockMemos = (count: number = 50): Memo[] => {
  const memos: Memo[] = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    // 随机生成过去90天内的日期
    const daysAgo = Math.floor(Math.random() * 90);
    const date = subDays(today, daysAgo);
    
    // 随机选择1-3个标签
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const tagIds: string[] = [];
    
    for (let j = 0; j < tagCount; j++) {
      const randomTagId = mockTags[Math.floor(Math.random() * mockTags.length)].id;
      if (!tagIds.includes(randomTagId)) {
        tagIds.push(randomTagId);
      }
    }
    
    // 创建备忘录
    memos.push({
      id: `memo-${i + 1}`,
      content: `这是第 ${i + 1} 条备忘录的内容。这里可以是任何文本内容，包括一些想法、笔记或者待办事项。`,
      tags: tagIds,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString()
    });
  }
  
  // 按日期排序，最新的在前面
  return memos.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// 导出模拟数据
export const mockMemos = generateMockMemos(); 