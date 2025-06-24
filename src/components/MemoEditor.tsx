import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiCheck, FiTag, FiX, FiPaperclip, FiImage, FiTrash2 } from 'react-icons/fi';
import { Tag, Memo } from '../types';
import { useConfig } from '../utils/ConfigContext';
import { apiUpload } from '../utils/storageUtils';

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
  const [images, setImages] = useState<{ name: string; url: string; type: string }[]>([]);
  const [files, setFiles] = useState<{ name: string; url: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagButtonRef = useRef<HTMLButtonElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const { config } = useConfig();
  const [showUploadTip, setShowUploadTip] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // 获取当前行的开始位置
      let lineStart = start;
      while (lineStart > 0 && value[lineStart - 1] !== '\n') {
        lineStart--;
      }

      // 获取当前行的结束位置
      let lineEnd = end;
      while (lineEnd < value.length && value[lineEnd] !== '\n') {
        lineEnd++;
      }

      // 获取当前行的内容
      const currentLine = value.substring(lineStart, lineEnd);

      // 检查是否以 "- " 或 "- [ ] " 开头
      const isDashList = currentLine.startsWith('- ');
      const isCheckboxList = currentLine.startsWith('- [ ] ');

      if (isDashList || isCheckboxList) {
        e.preventDefault();

        // 获取当前行的前缀（"- " 或 "- [ ] "）
        const prefix = isCheckboxList ? '- [ ] ' : '- ';

        // 检查当前行是否有内容（除了前缀和空格）
        const lineContent = currentLine.substring(prefix.length).trim();

        if (lineContent === '') {
          // 如果当前行没有内容，删除当前行
          const newValue = value.substring(0, lineStart) + value.substring(lineEnd + 1);
          setContent(newValue);

          // 设置光标位置到上一行的末尾
          setTimeout(() => {
            const newCursorPos = Math.min(lineStart, newValue.length);
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
        } else {
          // 如果当前行有内容，创建新行
          const beforeCursor = value.substring(0, start);
          const afterCursor = value.substring(end);
          const newValue = beforeCursor + '\n' + prefix + afterCursor;
          setContent(newValue);

          // 设置光标位置到新行的前缀之后
          setTimeout(() => {
            const newCursorPos = start + 1 + prefix.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
        }
      }
    }
  };

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

  // 点击外部关闭标签下拉
  useEffect(() => {
    if (!showTagDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node) &&
        tagButtonRef.current &&
        !tagButtonRef.current.contains(event.target as Node)
      ) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTagDropdown]);

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

  // 插入图片/附件到内容
  const handleInsertAttachment = (att: { name: string; url: string; type: string }) => {
    let insertText = '';
    if (att.type.startsWith('image/')) {
      insertText = `![${att.name}](${att.url})`;
    } else {
      insertText = `[${att.name}](${att.url})`;
    }
    setContent((prev) => (prev ? prev + '\n' + insertText : insertText));
  };

  // 移除图片/附件
  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleRemoveFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // 处理粘贴事件
  const handlePaste = async (e: React.ClipboardEvent) => {
    if (!config.api.enabled) {
      setShowUploadTip(true);
      setTimeout(() => setShowUploadTip(false), 2000);
      return;
    }

    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault(); // 阻止默认粘贴行为

      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await apiUpload('/api/upload', formData);

          if (!res.ok) throw new Error('上传失败');

          const data = await res.json();
          setImages((prev) => [...prev, { name: data.name || file.name, url: data.url, type: file.type }]);
        } catch (err) {
          alert('图片上传失败: ' + (err instanceof Error ? err.message : '未知错误'));
        }
      }
    }
  };

  // 处理拖拽事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!config.api.enabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!config.api.enabled) {
      setShowUploadTip(true);
      setTimeout(() => setShowUploadTip(false), 2000);
      return;
    }

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await apiUpload('/api/upload', formData);
        if (!res.ok) throw new Error('上传失败');
        const data = await res.json();
        setImages((prev) => [...prev, { name: data.name || file.name, url: data.url, type: file.type }]);
      } catch (err) {
        alert('图片上传失败: ' + (err instanceof Error ? err.message : '未知错误'));
      }
    }
  };

  // 内联编辑器内容
  const editorContent = (
    <>
      <div className={`${isModal ? 'p-2 overflow-y-auto flex-grow' : 'p-2'}`}>
        {((editingMemo && onCancelEdit && !isModal) || (isModal && onClose)) && (
          <div className="flex justify-end items-center mb-3">
            <motion.button
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </motion.button>
          </div>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onKeyDown={handleKeyDown}
            placeholder="写下你的想法..."
            className={`w-full p-4 border ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all font-mono text-sm`}
            rows={4}
            disabled={isSubmitting}
          />
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-50 rounded-lg pointer-events-none">
              <div className="text-blue-500 text-sm font-medium">拖放图片到这里</div>
            </div>
          )}
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
        {/* 已选标签展示 */}
        {selectedTags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {tags
              .filter((tag) => selectedTags.includes(tag.id))
              .map((tag) => (
                <span
                  key={tag.id}
                  className="flex items-center px-2 py-0.5 rounded-full text-xs text-white"
                  style={{ background: tag.color }}
                >
                  {tag.name}
                  <button
                    type="button"
                    className="ml-1 text-white hover:text-gray-200"
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>
        )}
        {/* 图片预览区 */}
        {images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {images.map((att, idx) => (
              <div
                key={att.url}
                className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs"
              >
                <img src={att.url} alt={att.name} className="w-8 h-8 object-cover rounded mr-2" />
                <span className="truncate max-w-[100px]" title={att.name}>
                  {att.name}
                </span>
                <button
                  type="button"
                  className="ml-2 text-blue-500 hover:underline"
                  onClick={() => handleInsertAttachment(att)}
                  title="插入到内容"
                >
                  插入
                </button>
                <button
                  type="button"
                  className="ml-1 text-gray-400 hover:text-red-500"
                  onClick={() => handleRemoveImage(idx)}
                  title="移除"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* 附件区 */}
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((att, idx) => (
              <div
                key={att.url}
                className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs"
              >
                <FiPaperclip className="mr-1 text-gray-400" />
                <span className="truncate max-w-[100px]" title={att.name}>
                  {att.name}
                </span>
                <button
                  type="button"
                  className="ml-2 text-blue-500 hover:underline"
                  onClick={() => handleInsertAttachment(att)}
                  title="插入到内容"
                >
                  插入
                </button>
                <button
                  type="button"
                  className="ml-1 text-gray-400 hover:text-red-500"
                  onClick={() => handleRemoveFile(idx)}
                  title="移除"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* 操作按钮区和保存按钮同一行，两端对齐 */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 z-10">
            {/* 标签选择按钮 */}
            <div className="relative">
              <button
                ref={tagButtonRef}
                type="button"
                className="flex items-center px-1.5 py-1 rounded hover:bg-gray-100 text-gray-700 text-base"
                onClick={() => setShowTagDropdown((v) => !v)}
                title="选择标签"
              >
                <FiTag className="mr-0.5" />
              </button>
              <AnimatePresence>
                {showTagDropdown && (
                  <motion.div
                    ref={tagDropdownRef}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[160px] p-2"
                  >
                    {tags.length === 0 && <div className="text-gray-400 text-sm px-2 py-1">暂无标签</div>}
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        className={`flex items-center w-full px-2 py-1 rounded text-sm mb-1 ${
                          selectedTags.includes(tag.id)
                            ? 'bg-blue-100 text-blue-600'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        style={{ borderLeft: `4px solid ${tag.color}` }}
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {selectedTags.includes(tag.id) && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        )}
                        {!selectedTags.includes(tag.id) && (
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-2"
                            style={{ background: tag.color }}
                          ></span>
                        )}
                        {tag.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* 合并后的上传按钮 */}
            <div className="relative">
              <button
                type="button"
                className="flex items-center px-1.5 py-1 rounded hover:bg-gray-100 text-gray-700 text-base"
                onClick={() => {
                  if (!config.api.enabled) {
                    setShowUploadTip(true);
                    setTimeout(() => setShowUploadTip(false), 2000);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                title="上传图片或文件"
              >
                <FiImage className="mr-0.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="*"
                style={{ display: 'none' }}
                multiple
                onChange={async (e) => {
                  if (!config.api.enabled) return;
                  const files = e.target.files;
                  if (!files) return;
                  const uploaders = Array.from(files).map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const res = await apiUpload('/api/upload', formData);
                      if (!res.ok) throw new Error('上传失败');
                      const data = await res.json();
                      if (file.type.startsWith('image/')) {
                        setImages((prev) => [
                          ...prev,
                          { name: data.name || file.name, url: data.url, type: file.type },
                        ]);
                      } else {
                        setFiles((prev) => [...prev, { name: data.name || file.name, url: data.url, type: file.type }]);
                      }
                    } catch (err) {
                      alert('文件上传失败: ' + (err instanceof Error ? err.message : '未知错误'));
                    }
                  });
                  await Promise.all(uploaders);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              />
              {/* 自定义气泡提示 */}
              {showUploadTip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow z-50 whitespace-nowrap">
                  当前未启用API，暂不支持上传
                </div>
              )}
            </div>
          </div>
          {/* 保存按钮 */}
          <motion.button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className={`px-3 py-1.5 rounded text-sm text-white flex items-center shadow-sm ${
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
                {editingMemo ? '更新' : '保存'}
              </>
            )}
          </motion.button>
        </div>
      </div>
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
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
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
      className="bg-white rounded-lg shadow-sm mb-6 relative"
    >
      {editorContent}
    </motion.form>
  );
};

export default MemoEditor;
