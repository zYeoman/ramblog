import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiCheck, FiTag, FiX } from 'react-icons/fi';
import { Tag, Memo } from '../types';

interface MemoEditorProps {
  tags: Tag[];
  onSave: (content: string, selectedTags: string[]) => void;
  editingMemo?: Memo | null;
  onCancelEdit?: () => void;
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const MemoEditor: React.FC<MemoEditorProps> = ({
  tags,
  onSave,
  editingMemo,
  onCancelEdit,
  isModal = false,
  isOpen = true,
  onClose,
}) => {
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 当编辑的备忘录发生变化时，更新表单内容
  useEffect(() => {
    if (editingMemo) {
      setContent(editingMemo.content);
      setSelectedTags(editingMemo.tags);

      // 聚焦到文本区域
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    } else if (!editingMemo && !isModal) {
      // 清空表单（仅在非模态框且非编辑模式下）
      setContent('');
      setSelectedTags([]);
    }
  }, [editingMemo, isModal, isOpen]);

  // 自动调整文本区域高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // 点击外部关闭模态框（仅在模态框模式下）
  useEffect(() => {
    if (!isModal) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        if (onClose) onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModal, isOpen, onClose]);

  // 按ESC关闭模态框（仅在模态框模式下）
  useEffect(() => {
    if (!isModal) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onClose) onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModal, isOpen, onClose]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (content.trim()) {
      setIsSubmitting(true);

      // 添加一个短暂的延迟，让动画效果更明显
      setTimeout(() => {
        onSave(content, selectedTags);

        // 显示成功动画
        setShowSuccess(true);

        // 如果不是编辑模式且不是模态框，则清空表单
        if (!editingMemo && !isModal) {
          setContent('');
          setSelectedTags([]);
        }

        setIsSubmitting(false);

        // 成功后的操作
        setTimeout(() => {
          setShowSuccess(false);

          // 如果是模态框，则关闭
          if (isModal && onClose) {
            onClose();
          }
        }, 500);
      }, 300);
    }
  };

  const handleCancel = () => {
    if (isModal && onClose) {
      onClose();
    } else if (onCancelEdit) {
      onCancelEdit();
      setContent('');
      setSelectedTags([]);
    }
  };

  // 内联编辑器内容
  const editorContent = (
    <>
      <div className={`${isModal ? 'p-6 overflow-y-auto flex-grow' : 'p-6'}`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-gray-800">{editingMemo ? '编辑备忘录' : '添加备忘录'}</h3>
          </div>
          {((editingMemo && onCancelEdit && !isModal) || (isModal && onClose)) && (
            <motion.button
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        <div className="mb-4 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的想法... (支持Markdown语法)"
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all font-mono text-sm"
            rows={4}
            disabled={isSubmitting}
          />

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg"
              >
                <motion.div
                  className="text-green-500 flex items-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1, repeat: 1 }}
                >
                  <FiCheck className="w-6 h-6 mr-2" />
                  <span>已保存!</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-10" // 添加底部边距，为保存按钮留出空间
          >
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <FiTag className="mr-1" />
              <p>选择标签：</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <motion.button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedTags.includes(tag.id)
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                  }}
                >
                  <div className="flex items-center">
                    {selectedTags.includes(tag.id) ? (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </motion.svg>
                    ) : (
                      <span className="w-2.5 h-2.5 mr-1 rounded-full" style={{ backgroundColor: tag.color }}></span>
                    )}
                    {tag.name}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 模态框底部按钮 */}
      {isModal && (
        <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
          <motion.button
            type="button"
            onClick={handleCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-200"
          >
            取消
          </motion.button>

          <motion.button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className={`px-5 py-2 rounded-lg text-white flex items-center ${
              content.trim() && !isSubmitting ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'
            }`}
            whileHover={
              content.trim() && !isSubmitting ? { y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}
            }
            whileTap={content.trim() && !isSubmitting ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2 inline-block"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.span>
                保存中...
              </span>
            ) : (
              <>
                <FiSave className="mr-1" />
                保存
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* 非模态框保存按钮 - 位于整个编辑框内部的右下角 */}
      {!isModal && (
        <motion.button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className={`absolute bottom-4 right-4 px-4 py-2 rounded-lg text-white flex items-center shadow-sm ${
            content.trim() && !isSubmitting ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'
          }`}
          whileHover={content.trim() && !isSubmitting ? { y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
          whileTap={content.trim() && !isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2 inline-block"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.span>
              保存中...
            </span>
          ) : (
            <>
              <FiSave className="mr-1" />
              {editingMemo ? '更新' : '保存'}
            </>
          )}
        </motion.button>
      )}
    </>
  );

  // 如果是模态框模式
  if (isModal) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <form onSubmit={handleSubmit}>{editorContent}</form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // 常规编辑器模式
  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden relative"
    >
      {editorContent}
    </motion.form>
  );
};

export default MemoEditor;
