import React from 'react';
import { motion } from 'framer-motion';
import { FiTag, FiCheck } from 'react-icons/fi';
import { Tag } from '../types';

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ tags, selectedTags, onTagSelect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="mb-6"
    >
      <div className="flex items-center mb-3">
        <FiTag className="mr-2 text-gray-600" />
        <h3 className="text-xl font-medium text-gray-800">标签</h3>
      </div>
      
      <motion.div 
        initial={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
        whileHover={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)" }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <motion.button
              key={tag.id}
              onClick={() => onTagSelect(tag.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
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
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <FiCheck className="w-3 h-3 mr-1.5" />
                  </motion.div>
                ) : (
                  <span 
                    className="w-3 h-3 mr-1.5 rounded-full" 
                    style={{ backgroundColor: tag.color }}
                  ></span>
                )}
                {tag.name}
              </div>
            </motion.button>
          ))}
        </div>
        
        {tags.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-4 text-gray-500"
          >
            <FiTag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p>还没有标签</p>
            <p className="text-sm mt-1">创建一些标签来组织你的备忘录</p>
          </motion.div>
        )}
        
      </motion.div>
    </motion.div>
  );
};

export default TagSelector; 