import React from 'react';
import { FiTag, FiCheck } from 'react-icons/fi';
import { Tag } from '../types';

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ tags, selectedTags, onTagSelect }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        <FiTag className="mr-2 text-gray-600" />
        <h3 className="text-xl font-medium text-gray-800">标签</h3>
      </div>

      <div className="rounded-lg p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagSelect(tag.id)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                selectedTags.includes(tag.id)
                  ? 'text-white'
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{
                backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
              }}
            >
              <div className="flex items-center">
                {selectedTags.includes(tag.id) ? (
                  <div>
                    <FiCheck className="w-3 h-3 mr-1.5" />
                  </div>
                ) : (
                  <span className="w-3 h-3 mr-1.5 rounded-full" style={{ backgroundColor: tag.color }}></span>
                )}
                {tag.name}
              </div>
            </button>
          ))}
        </div>

        {tags.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <FiTag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p>还没有标签</p>
            <p className="text-sm mt-1">创建一些标签来组织你的备忘录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
