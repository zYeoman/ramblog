import { format, subMonths, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { HeatmapValue, Memo } from '../types';

// 格式化日期
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

// 获取过去N个月的日期范围
export const getLastNMonthsRange = (months: number) => {
  const endDate = new Date();
  const startDate = subMonths(endDate, months);
  return { startDate, endDate };
};

// 将备忘录数据转换为热力图数据
export const getMemoHeatmapData = (memos: Memo[], startDate?: Date, endDate?: Date): HeatmapValue[] => {
  // 创建一个Map来存储每天的备忘录数量
  const countByDate = new Map<string, number>();

  // 过滤日期范围内的备忘录
  const filteredMemos =
    startDate && endDate
      ? memos.filter((memo) => {
          const memoDate = new Date(memo.createdAt);
          return memoDate >= startDate && memoDate <= endDate;
        })
      : memos;

  // 统计每天的备忘录数量
  filteredMemos.forEach((memo) => {
    const date = format(new Date(memo.createdAt), 'yyyy-MM-dd');
    const count = countByDate.get(date) || 0;
    countByDate.set(date, count + 1);
  });

  // 转换为热力图需要的格式
  return Array.from(countByDate.entries()).map(([date, count]) => ({
    date,
    count,
  }));
};

// 获取每天的备忘录数量，返回对象格式
export const getMemoCountByDate = (memos: Memo[]): Record<string, number> => {
  const countByDate: Record<string, number> = {};

  // 统计每天的备忘录数量
  memos.forEach((memo) => {
    const date = format(new Date(memo.createdAt), 'yyyy-MM-dd');
    countByDate[date] = (countByDate[date] || 0) + 1;
  });

  return countByDate;
};

// 获取过去N个月的所有日期
export const getLastNMonthsDays = (months: number = 6): string[] => {
  const { startDate, endDate } = getLastNMonthsRange(months);
  return eachDayOfInterval({ start: startDate, end: endDate }).map((date) => format(date, 'yyyy-MM-dd'));
};

// 获取热力图的最大值
export const getMaxCount = (data: HeatmapValue[]): number => {
  if (data.length === 0) return 0;
  return Math.max(...data.map((item) => item.count));
};
