'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { format, parseISO} from 'date-fns';
import MonthCalendar from '../components/MonthCalendar';
import TagSelector from '../components/TagSelector';
import MemoList from '../components/MemoList';
import MemoEditor from '../components/MemoEditor';
import { Memo, Tag } from '../types';
import { 
  getMemos, 
  getTags, 
  addMemo, 
  deleteMemo, 
  editMemo, 
  togglePinMemo, 
  toggleArchiveMemo,
} from '../utils/storageUtils';
import { FiArchive, FiArrowRight, FiX, FiSettings } from 'react-icons/fi';

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // 初始化数据
  useEffect(() => {
    const loadData = () => {
      try {
        const storedMemos = getMemos();
        const storedTags = getTags();
        
        setMemos(storedMemos);
        setTags(storedTags); 
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
      }
    };
    
    loadData();
  }, []);

  // 当备忘录、选定的标签或日期发生变化时，过滤备忘录
  useEffect(() => {
    let filtered = [...memos];
    
    // 过滤归档的备忘录
    if (!showArchived) {
      filtered = filtered.filter(memo => !memo.isArchived);
    }
    
    // 按标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(memo => 
        memo.tags.some(tagId => selectedTags.includes(tagId))
      );
    }
    
    // 按日期筛选
    if (selectedDate) {
      filtered = filtered.filter(memo => {
        const memoDate = memo.createdAt.split('T')[0];
        return memoDate === selectedDate;
      });
    }
    
    setFilteredMemos(filtered);
  }, [memos, selectedTags, selectedDate, showArchived]);

  // 处理标签选择
  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  // 处理日期选择
  const handleDateClick = (date: string | null) => {
    setSelectedDate(date);
  };

  // 清除所有筛选
  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedDate(null);
  };

  // 添加新备忘录
  const handleSaveMemo = (content: string, tagIds: string[]) => {
    try {
      if (editingMemo) {
        // 编辑现有备忘录
        const updatedMemos = editMemo(editingMemo.id, content, tagIds);
        setMemos(updatedMemos);
        setEditingMemo(null);
      } else {
        // 添加新备忘录
        const newMemo: Memo = {
          id: uuidv4(),
          content,
          tags: tagIds,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: false,
          isArchived: false
        };
        
        const updatedMemos = addMemo(newMemo);
        setMemos(updatedMemos);
      }
    } catch (error) {
      console.error('保存备忘录失败:', error);
      alert('保存失败，请刷新页面重试');
    }
  };

  // 删除备忘录
  const handleDeleteMemo = (id: string) => {
    try {
      const updatedMemos = deleteMemo(id);
      setMemos(updatedMemos);
    } catch (error) {
      console.error('删除备忘录失败:', error);
    }
  };

  // 编辑备忘录 - 打开模态框
  const handleEditMemo = (id: string) => {
    const memo = memos.find(memo => memo.id === id);
    if (memo) {
      setEditingMemo(memo);
      setIsModalOpen(true);
    }
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMemo(null);
  };

  // 在模态框中保存备忘录
  const handleSaveInModal = (content: string, tagIds: string[]) => {
    try {
      if (editingMemo) {
        const updatedMemos = editMemo(editingMemo.id, content, tagIds);
        setMemos(updatedMemos);
      }
    } catch (error) {
      console.error('保存备忘录失败:', error);
      alert('保存失败，请刷新页面重试');
    }
  };

  // 置顶/取消置顶备忘录
  const handleTogglePinMemo = (id: string) => {
    try {
      const updatedMemos = togglePinMemo(id);
      setMemos(updatedMemos);
    } catch (error) {
      console.error('置顶备忘录失败:', error);
    }
  };

  // 归档/取消归档备忘录
  const handleArchiveMemo = (id: string) => {
    try {
      const updatedMemos = toggleArchiveMemo(id);
      setMemos(updatedMemos);
    } catch (error) {
      console.error('归档备忘录失败:', error);
    }
  };

  // 切换显示归档备忘录
  const toggleShowArchived = () => {
    setShowArchived(prev => !prev);
  };

  // 获取筛选状态文本
  const getFilterStatusText = () => {
    let baseText = '';
    
    if (selectedDate && selectedTags.length > 0) {
      const formattedDate = format(parseISO(selectedDate), 'yyyy年MM月dd日');
      baseText = `${formattedDate} + ${selectedTags.length}个标签 (${filteredMemos.length}条)`;
    } else if (selectedDate) {
      const formattedDate = format(parseISO(selectedDate), 'yyyy年MM月dd日');
      baseText = `${formattedDate} (${filteredMemos.length}条)`;
    } else if (selectedTags.length > 0) {
      baseText = `已筛选 ${filteredMemos.length} 条备忘录`;
    } else {
      baseText = `${showArchived ? '所有' : '活跃'}备忘录 (${filteredMemos.length})`;
    }
    
    return baseText;
  };



  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row">
          {/* 侧边栏 */}
          <div className="w-full lg:w-1/3 lg:pr-6">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* 标题区域 */}
              <div className="mb-6 animate-slide-in-top">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-gray-800">ramblog</h1>
                  <Link 
                    href="/config" 
                    className="text-gray-500 hover:text-blue-500 transition-colors"
                    title="应用配置"
                  >
                    <FiSettings className="w-5 h-5" />
                  </Link>
                </div>
                <p className="text-gray-500 mt-2">记录你的想法和灵感</p>
              </div>

              <div>
                <div className="flex justify-end items-center mb-3">
                  <Link 
                    href="/heatmap" 
                    className="text-sm text-blue-500 hover:text-blue-700 flex"
                  >
                    <span>查看热力图</span>
                    <FiArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <MonthCalendar 
                  memos={memos} 
                  onDateClick={handleDateClick} 
                  selectedDate={selectedDate} 
                />
              </div>
              
              <TagSelector
                tags={tags}
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
              />
            </div>
          </div>
          
          {/* 分割线 - 仅在大屏幕上显示 */}
          <div className="hidden lg:block border-l border-gray-200 mx-2"></div>
          
          {/* 主内容区 */}
          <div className="w-full lg:w-2/3 lg:pl-6 space-y-6 mt-6 lg:mt-0">
            <MemoEditor 
              tags={tags} 
              onSave={handleSaveMemo} 
              editingMemo={null}
            />
            
            <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">
                {getFilterStatusText()}
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleShowArchived}
                  className={`text-sm ${showArchived ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-700 flex items-center`}
                >
                  <FiArchive className="w-4 h-4 mr-1" />
                  {showArchived ? '隐藏归档' : '显示归档'}
                </button>
                
                {(selectedTags.length > 0 || selectedDate) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-500 hover:text-blue-700 flex items-centert"
                  >
                    <FiX className="w-4 h-4 mr-1" />
                    清除筛选
                  </button>
                )}
              </div>
            </div>
            
            <MemoList
              memos={filteredMemos}
              tags={tags}
              onDeleteMemo={handleDeleteMemo}
              onEditMemo={handleEditMemo}
              onTogglePinMemo={handleTogglePinMemo}
              onArchiveMemo={handleArchiveMemo}
              onUpdateMemos={setMemos}
            />
          </div>
        </div>
      </div>

      {/* 编辑备忘录的模态框 */}
      <MemoEditor
        isModal={true}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingMemo={editingMemo}
        tags={tags}
        onSave={handleSaveInModal}
      />
    </main>
  );
} 