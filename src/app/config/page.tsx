'use client';

import React, { useState, useRef } from 'react';
import { useConfig } from '../../utils/ConfigContext';
import Link from 'next/link';

export default function ConfigPage() {
  const { config, updateConfig, resetToDefault, importConfig, downloadConfig } = useConfig();
  const [activeTab, setActiveTab] = useState('theme');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleColorChange = (key: string, value: string) => {
    updateConfig({
      theme: {
        ...config.theme,
        [key]: value,
      },
    });
  };

  const handleFontChange = (key: string, value: string) => {
    if (key === 'fontFamily') {
      updateConfig({
        typography: {
          ...config.typography,
          fontFamily: value,
        },
      });
    } else if (key.startsWith('fontSize.')) {
      const fontSizeKey = key.split('.')[1] as keyof typeof config.typography.fontSize;
      updateConfig({
        typography: {
          ...config.typography,
          fontSize: {
            ...config.typography.fontSize,
            [fontSizeKey]: value,
          },
        },
      });
    } else if (key === 'lineHeight') {
      updateConfig({
        typography: {
          ...config.typography,
          lineHeight: value,
        },
      });
    }
  };

  const handleLayoutChange = (key: string, value: string) => {
    updateConfig({
      layout: {
        ...config.layout,
        [key]: value,
      },
    });
  };

  const handleAnimationChange = (key: string, value: string) => {
    updateConfig({
      animation: {
        ...config.animation,
        [key]: value,
      },
    });
  };

  const handleToggleDarkMode = () => {
    updateConfig({
      theme: {
        ...config.theme,
        darkMode: !config.theme.darkMode,
      },
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonConfig = event.target?.result as string;
        importConfig(jsonConfig);
        setImportError(null);
      } catch (error) {
        setImportError('导入配置失败，请确保文件格式正确');
        console.error('导入配置失败:', error);
      }
    };
    reader.readAsText(file);
    
    // 重置文件输入，以便同一文件可以再次选择
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="config-page">
      <header className="header">
        <h1>应用配置</h1>
        <Link href="/" className="back-link">
          返回首页
        </Link>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'theme' ? 'active' : ''}`}
          onClick={() => setActiveTab('theme')}
        >
          主题
        </button>
        <button
          className={`tab ${activeTab === 'typography' ? 'active' : ''}`}
          onClick={() => setActiveTab('typography')}
        >
          排版
        </button>
        <button
          className={`tab ${activeTab === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('layout')}
        >
          布局
        </button>
        <button
          className={`tab ${activeTab === 'animation' ? 'active' : ''}`}
          onClick={() => setActiveTab('animation')}
        >
          动画
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'theme' && (
          <div className="theme-settings">
            <div className="form-group">
              <label htmlFor="primaryColor">主色调</label>
              <div className="color-input">
                <input
                  type="color"
                  id="primaryColor"
                  value={config.theme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                />
                <input
                  type="text"
                  value={config.theme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="secondaryColor">次要色调</label>
              <div className="color-input">
                <input
                  type="color"
                  id="secondaryColor"
                  value={config.theme.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                />
                <input
                  type="text"
                  value={config.theme.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="backgroundColor">背景色</label>
              <div className="color-input">
                <input
                  type="color"
                  id="backgroundColor"
                  value={config.theme.backgroundColor}
                  onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                />
                <input
                  type="text"
                  value={config.theme.backgroundColor}
                  onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="textColor">文本颜色</label>
              <div className="color-input">
                <input
                  type="color"
                  id="textColor"
                  value={config.theme.textColor}
                  onChange={(e) => handleColorChange('textColor', e.target.value)}
                />
                <input
                  type="text"
                  value={config.theme.textColor}
                  onChange={(e) => handleColorChange('textColor', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="darkMode">深色模式</label>
              <input
                type="checkbox"
                id="darkMode"
                checked={config.theme.darkMode}
                onChange={handleToggleDarkMode}
              />
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="typography-settings">
            <div className="form-group">
              <label htmlFor="fontFamily">字体</label>
              <input
                type="text"
                id="fontFamily"
                value={config.typography.fontFamily}
                onChange={(e) => handleFontChange('fontFamily', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fontSize">基础字体大小</label>
              <input
                type="text"
                id="fontSize"
                value={config.typography.fontSize.base}
                onChange={(e) => handleFontChange('fontSize.base', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="heading1">标题1大小</label>
              <input
                type="text"
                id="heading1"
                value={config.typography.fontSize.heading1}
                onChange={(e) => handleFontChange('fontSize.heading1', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="heading2">标题2大小</label>
              <input
                type="text"
                id="heading2"
                value={config.typography.fontSize.heading2}
                onChange={(e) => handleFontChange('fontSize.heading2', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="heading3">标题3大小</label>
              <input
                type="text"
                id="heading3"
                value={config.typography.fontSize.heading3}
                onChange={(e) => handleFontChange('fontSize.heading3', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lineHeight">行高</label>
              <input
                type="text"
                id="lineHeight"
                value={config.typography.lineHeight}
                onChange={(e) => handleFontChange('lineHeight', e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="layout-settings">
            <div className="form-group">
              <label htmlFor="contentWidth">内容宽度</label>
              <input
                type="text"
                id="contentWidth"
                value={config.layout.contentWidth}
                onChange={(e) => handleLayoutChange('contentWidth', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sidebarWidth">侧边栏宽度</label>
              <input
                type="text"
                id="sidebarWidth"
                value={config.layout.sidebarWidth}
                onChange={(e) => handleLayoutChange('sidebarWidth', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="headerHeight">头部高度</label>
              <input
                type="text"
                id="headerHeight"
                value={config.layout.headerHeight}
                onChange={(e) => handleLayoutChange('headerHeight', e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === 'animation' && (
          <div className="animation-settings">
            <div className="form-group">
              <label htmlFor="transitionSpeed">过渡速度</label>
              <input
                type="text"
                id="transitionSpeed"
                value={config.animation.transitionSpeed}
                onChange={(e) => handleAnimationChange('transitionSpeed', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="config-actions">
        <button className="reset-button" onClick={resetToDefault}>
          重置为默认值
        </button>
        <button className="export-button" onClick={downloadConfig}>
          导出配置
        </button>
        <button className="import-button" onClick={handleImportClick}>
          导入配置
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={handleFileChange}
        />
      </div>

      {importError && <div className="error-message">{importError}</div>}

      <style jsx>{`
        .config-page {
          max-width: var(--content-width);
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .back-link {
          text-decoration: none;
          padding: 0.5rem 1rem;
          background-color: var(--primary-color);
          color: white;
          border-radius: 4px;
        }

        .tabs {
          display: flex;
          margin-bottom: 2rem;
          border-bottom: 1px solid #ddd;
        }

        .tab {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          position: relative;
        }

        .tab.active {
          color: var(--primary-color);
        }

        .tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--primary-color);
        }

        .tab-content {
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input[type="text"] {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .color-input {
          display: flex;
          gap: 1rem;
        }

        .color-input input[type="color"] {
          width: 50px;
          height: 40px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .color-input input[type="text"] {
          flex: 1;
        }

        .config-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .config-actions button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .reset-button {
          background-color: #f3f4f6;
          color: #374151;
        }

        .export-button, .import-button {
          background-color: var(--primary-color);
          color: white;
        }

        .error-message {
          margin-top: 1rem;
          padding: 0.75rem;
          background-color: #fee2e2;
          color: #b91c1c;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
} 