'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeatMap from '../../components/HeatMap';
import { Memo } from '../../types';
import { getMemos } from '../../utils/storageUtils';

export default function HeatMapPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [months, setMonths] = useState(6);

  // 初始化数据
  useEffect(() => {
    const loadData = () => {
      try {
        const storedMemos = getMemos();
        setMemos(storedMemos);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };
    
    loadData();
  }, []);

  // 改变热力图显示的月数
  const handleMonthChange = (newMonths: number) => {
    setMonths(newMonths);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row animate-fade-in">
          {/* 侧边栏 */}
          <div className="w-full lg:w-1/3 lg:pr-6">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* 标题区域 */}
              <div className="mb-6">
                <div className="flex items-center">
                  <Link href="/" className="text-blue-500 hover:text-blue-700 flex items-center mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                  </Link>
                  <h1 className="text-3xl font-bold text-gray-800">活动热力图</h1>
                </div>
                <p className="text-gray-500 mt-2">查看你的备忘录活动历史</p>
              </div>

              {/* 热力图设置 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-medium mb-4 text-gray-800">热力图设置</h2>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-4">显示月数:</span>
                  <div className="flex flex-wrap gap-2">
                    {[3, 6, 9, 12].map(m => (
                      <button
                        key={m}
                        onClick={() => handleMonthChange(m)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          months === m 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {m}个月
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 统计信息 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4 text-gray-800">统计信息</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{memos.length}</div>
                    <div className="text-sm text-gray-500">总备忘录数</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {Object.keys(memos.reduce((acc: Record<string, boolean>, memo) => {
                        const date = memo.createdAt.split('T')[0];
                        acc[date] = true;
                        return acc;
                      }, {})).length}
                    </div>
                    <div className="text-sm text-gray-500">活跃天数</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {memos.length > 0 
                        ? Math.round(memos.reduce((sum, memo) => sum + memo.content.length, 0) / memos.length) 
                        : 0}
                    </div>
                    <div className="text-sm text-gray-500">平均字符数</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 分割线 - 仅在大屏幕上显示 */}
          <div className="hidden lg:block border-l border-gray-200 mx-2"></div>
          
          {/* 主内容区 - 热力图 */}
          <div className="w-full lg:w-2/3 lg:pl-6 mt-6 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <HeatMap memos={memos} months={months} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 