'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiX, FiEdit, FiStar, FiArchive, FiCheckCircle, FiCircle, FiFileText } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Memo, Tag } from '../types';
import { formatDate } from '../utils/dateUtils';
import { editMemo } from '../utils/storageUtils';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MemoListProps {
  memos: Memo[];
  tags: Tag[];
  onDeleteMemo?: (id: string) => void;
  onEditMemo?: (id: string) => void;
  onTogglePinMemo?: (id: string) => void;
  onArchiveMemo?: (id: string) => void;
  onUpdateMemos?: (memos: Memo[]) => void;
}

const MemoList: React.FC<MemoListProps> = ({
  memos,
  tags,
  onDeleteMemo,
  onEditMemo,
  onTogglePinMemo,
  onArchiveMemo,
  onUpdateMemos,
}) => {
  // 获取标签对象，通过ID
  const getTagById = (id: string) => {
    return tags.find((tag) => tag.id === id);
  };

  // 自定义复选框组件
  const CustomCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <span
      className={`inline-flex justify-center items-center w-4 h-4 mr-2 rounded cursor-pointer transition-all mt-1 ${
        checked ? 'text-blue-500' : 'text-gray-300'
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange();
      }}
    >
      {(checked && <FiCheckCircle className="w-4 h-4" />) || <FiCircle className="w-4 h-4" />}
    </span>
  );

  // 更新复选框状态
  const toggleCheckbox = async (memo: Memo, lineNumber: number, isChecked: boolean) => {
    // 分割内容为行
    const lines = memo.content.split('\n');

    lines[lineNumber - 1] = lines[lineNumber - 1].replace(/\[\s*[xX ]?\s*\]/, isChecked ? '[x]' : '[ ]');

    // 合并回完整内容
    const updatedContent = lines.join('\n');

    // 如果内容有变化，则更新备忘录
    if (updatedContent !== memo.content && onUpdateMemos) {
      const updatedMemos = await editMemo(memo.id, updatedContent, memo.tags);
      onUpdateMemos(updatedMemos);
    }
  };

  if (memos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg p-12 text-center text-gray-500 shadow-sm"
      >
        <FiFileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-lg">没有找到备忘录</p>
        <p className="text-sm mt-2">开始写下你的第一条备忘录吧</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <AnimatePresence>
        {memos.map((memo, index) => (
          <motion.div
            key={memo.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                delay: index * 0.05,
                type: 'spring',
                stiffness: 100,
              },
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{
              y: -3,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transition: { duration: 0.2 },
            }}
            className={`bg-white rounded-lg shadow-sm ${memo.isPinned ? 'border-l-4 border-blue-500' : ''}`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="text-sm text-gray-500 flex items-center">
                  <FiClock className="w-4 h-4 mr-1 text-gray-400" />
                  {formatDate(memo.createdAt)}
                  {memo.isPinned && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                      <FiStar className="w-3 h-3 mr-1" />
                      置顶
                    </span>
                  )}
                  {memo.isArchived && (
                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                      <FiArchive className="w-3 h-3 mr-1" />
                      已归档
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  {onEditMemo && (
                    <motion.button
                      onClick={() => onEditMemo(memo.id)}
                      className="text-gray-400 p-1 rounded-full hover:bg-gray-100"
                      whileHover={{
                        scale: 1.2,
                        color: '#3b82f6',
                        transition: { duration: 0.2 },
                      }}
                      aria-label="编辑备忘录"
                    >
                      <FiEdit className="h-4 w-4" />
                    </motion.button>
                  )}
                  {onTogglePinMemo && (
                    <motion.button
                      onClick={() => onTogglePinMemo(memo.id)}
                      className={`p-1 rounded-full hover:bg-gray-100 ${
                        memo.isPinned ? 'text-blue-500' : 'text-gray-400'
                      }`}
                      whileHover={{
                        scale: 1.2,
                        color: memo.isPinned ? '#3b82f6' : '#3b82f6',
                        transition: { duration: 0.2 },
                      }}
                      aria-label={memo.isPinned ? '取消置顶' : '置顶备忘录'}
                    >
                      <FiStar className="h-4 w-4" />
                    </motion.button>
                  )}
                  {onArchiveMemo && (
                    <motion.button
                      onClick={() => onArchiveMemo(memo.id)}
                      className={`p-1 rounded-full hover:bg-gray-100 ${
                        memo.isArchived ? 'text-gray-600' : 'text-gray-400'
                      }`}
                      whileHover={{
                        scale: 1.2,
                        color: memo.isArchived ? '#4b5563' : '#4b5563',
                        transition: { duration: 0.2 },
                      }}
                      aria-label={memo.isArchived ? '取消归档' : '归档备忘录'}
                    >
                      <FiArchive className="h-4 w-4" />
                    </motion.button>
                  )}
                  {onDeleteMemo && (
                    <motion.button
                      onClick={() => onDeleteMemo(memo.id)}
                      className="text-gray-400 p-1 rounded-full hover:bg-gray-100"
                      whileHover={{
                        scale: 1.2,
                        color: '#ef4444',
                        transition: { duration: 0.2 },
                      }}
                      aria-label="删除备忘录"
                    >
                      <FiX className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="mt-3 text-gray-800 markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[[rehypeKatex, { output: 'mathml' }]]}
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          language={match[1]}
                          PreTag="div"
                          showLineNumbers={true}
                          customStyle={{
                            backgroundColor: 'transparent',
                            padding: '0',
                            margin: '0',
                            lineHeight: '1.5',
                          }}
                          {...props}
                        >
                          {String(children).trimEnd()}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    li: ({ className, node, children, ...props }: any) => {
                      // 只处理任务列表项
                      if (className === 'task-list-item') {
                        let isChecked = false;
                        children.forEach((child: any) => {
                          if (child.type === 'input' && child.props.type === 'checkbox' && child.props.checked) {
                            isChecked = true;
                          }
                          if (child.type === 'p' && child.props.children.length > 0) {
                            child.props.children.forEach((child: any) => {
                              if (child.type === 'input' && child.props.type === 'checkbox' && child.props.checked) {
                                isChecked = true;
                              }
                            });
                          }
                        });

                        // 创建一个过滤掉checkbox的子元素数组
                        const filteredChildren = children.map((child: any) => {
                          if (child.type === 'p' && child.props.children.length > 0) {
                            // 为p元素创建一个新的React元素，带有过滤后的子元素
                            return React.cloneElement(child, {
                              ...child.props,
                              children: child.props.children.filter(
                                (c: any) => c.type !== 'input' || c.props.type !== 'checkbox'
                              ),
                            });
                          }
                          return child;
                        });
                        const inputChildren = filteredChildren.filter(
                          (child: any) => child.type !== 'input' || child.props.type !== 'checkbox'
                        );

                        return (
                          <div {...props} className="task-list-item flex items-start list-none ml-0 pl-0">
                            <CustomCheckbox
                              checked={isChecked}
                              onChange={() => toggleCheckbox(memo, node.position.start.line, !isChecked)}
                            />
                            <span className={`${isChecked ? 'line-through text-gray-400' : ''}`}>{inputChildren}</span>
                          </div>
                        );
                      }
                      // 处理普通列表项，去掉原生li的项目符号，改用span模拟
                      return (
                        <li className={className} {...props}>
                          {children}
                        </li>
                      );
                    },
                  }}
                >
                  {memo.content}
                </ReactMarkdown>
              </div>
              {memo.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {memo.tags.map((tagId) => {
                    const tag = getTagById(tagId);
                    if (!tag) return null;

                    return (
                      <motion.span
                        key={tag.id}
                        whileHover={{ y: -2 }}
                        className="px-2 py-0.5 text-xs rounded-full text-white flex items-center"
                        style={{ backgroundColor: tag.color }}
                      >
                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 opacity-70"></span>
                        {tag.name}
                      </motion.span>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default MemoList;
