import React from 'react';
import { motion } from 'framer-motion';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { FiCalendar } from 'react-icons/fi';
import { getLastNMonthsRange, getMemoHeatmapData, getMaxCount } from '../utils/dateUtils';
import { Memo } from '../types';

interface HeatMapProps {
  memos: Memo[];
  months?: number;
}

const HeatMap: React.FC<HeatMapProps> = ({ memos, months = 4 }) => {
  const { startDate, endDate } = getLastNMonthsRange(months);
  const heatmapData = getMemoHeatmapData(memos);
  const maxCount = getMaxCount(heatmapData);
  
  // 计算热力图颜色强度
  const getColorScale = (count: number) => {
    if (count === 0) return 'color-empty';
    const intensity = Math.ceil((count / maxCount) * 4);
    return `color-scale-${intensity}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-8"
    >
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center mb-3"
      >
        <FiCalendar className="mr-2 text-blue-500" />
        <h3 className="text-xl font-medium text-gray-800">活动热力图</h3>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pb-4"
        >
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={heatmapData}
            gutterSize={3}
            classForValue={(value) => {
              if (!value) {
                return 'color-empty';
              }
              return getColorScale(value.count);
            }}
            titleForValue={(value) => {
              if (!value) {
                return '没有备忘录';
              }
              return `${value.date}: ${value.count} 条备忘录`;
            }}
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100"
        >
          <div className="text-sm text-gray-500">过去 {months} 个月的活动</div>
          <div className="flex items-center">
            <span className="mr-1 text-xs text-gray-500">少</span>
            <div className="flex">
              <div className="w-4 h-4 bg-gray-100 rounded-sm mx-0.5"></div>
              <div className="w-4 h-4 bg-green-200 rounded-sm mx-0.5"></div>
              <div className="w-4 h-4 bg-green-400 rounded-sm mx-0.5"></div>
              <div className="w-4 h-4 bg-green-600 rounded-sm mx-0.5"></div>
              <div className="w-4 h-4 bg-green-800 rounded-sm mx-0.5"></div>
            </div>
            <span className="ml-1 text-xs text-gray-500">多</span>
          </div>
        </motion.div>
      </motion.div>
      
      <style jsx>{`
        :global(.react-calendar-heatmap) {
          width: 100%;
          height: 100%;
        }
        :global(.react-calendar-heatmap .color-empty) {
          fill: #f3f4f6;
        }
        :global(.react-calendar-heatmap .color-scale-1) {
          fill: #d1fae5;
        }
        :global(.react-calendar-heatmap .color-scale-2) {
          fill: #6ee7b7;
        }
        :global(.react-calendar-heatmap .color-scale-3) {
          fill: #34d399;
        }
        :global(.react-calendar-heatmap .color-scale-4) {
          fill: #059669;
        }
        :global(.react-calendar-heatmap rect) {
          rx: 2;
          ry: 2;
          stroke: white;
          stroke-width: 1;
        }
        :global(.react-calendar-heatmap rect:hover) {
          stroke: #4b5563;
          stroke-width: 2;
        }
        :global(.react-calendar-heatmap text) {
          font-size: 8px;
          fill: #6b7280;
        }
      `}</style>
    </motion.div>
  );
};

export default HeatMap; 