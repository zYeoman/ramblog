import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import { Memo } from '../types';
import { getMemoCountByDate } from '../utils/dateUtils';

interface MonthCalendarProps {
  memos: Memo[];
  onDateClick?: (date: string | null) => void;
  selectedDate?: string | null;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ memos, onDateClick, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 获取当月的所有日期
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const memoCountByDate = getMemoCountByDate(memos);

  // 获取特定日期的备忘录数量
  const getCountForDate = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return memoCountByDate[dateStr] || 0;
  };

  // 获取热力颜色
  const getHeatColor = (count: number): string => {
    if (count === 0) return 'bg-gray-50';
    if (count === 1) return 'bg-green-100';
    if (count === 2) return 'bg-green-200';
    if (count <= 4) return 'bg-green-300';
    if (count <= 6) return 'bg-green-400';
    return 'bg-green-500';
  };

  // 前一个月
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // 后一个月
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // 返回当月
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // 处理日期点击
  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (onDateClick) {
      onDateClick(dateStr);
    }
  };

  // 星期头部
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="w-full mb-8">
      <div className="rounded-lg shadow-sm overflow-hidden">
        {/* 月份导航 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center">
            <FiCalendar className="mr-2 text-gray-600" />
            <h3 className="text-xl font-medium text-gray-800">
              {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
            </h3>
            {!isSameMonth(currentMonth, new Date()) && (
              <button
                onClick={goToToday}
                className="ml-2 text-xs text-blue-500 hover:text-blue-700 py-1 px-2 rounded-full hover:bg-blue-50"
              >
                返回今月
              </button>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">
              <FiChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
              <FiChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* 日历网格 */}
        <div className="p-4 bg-gray-50">
          {/* 星期头部 */}
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {days.map((day) => {
              const count = getCountForDate(day);
              const isToday = isSameDay(day, new Date());
              const dateStr = format(day, 'yyyy-MM-dd');
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square rounded-lg ${getHeatColor(
                    count
                  )} flex flex-col items-center justify-center cursor-pointer hover:opacity-80 ${
                    isToday ? 'ring-2 ring-blue-400' : ''
                  } ${isSelected ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`}
                  title={`${format(day, 'yyyy-MM-dd')}: ${count} 条备忘录`}
                >
                  <span className={`text-sm font-medium ${count > 0 ? 'text-gray-800' : 'text-gray-500'}`}>
                    {format(day, 'd')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthCalendar;
