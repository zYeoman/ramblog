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

  const handleApiChange = (key: string, value: any) => {
    if (key === 'enabled') {
      updateConfig({
        api: {
          ...config.api,
          enabled: value,
        },
      });
    } else if (key === 'baseUrl') {
      updateConfig({
        api: {
          ...config.api,
          baseUrl: value,
        },
      });
    } else if (key.startsWith('endpoints.')) {
      const endpointKey = key.split('.')[1] as keyof typeof config.api.endpoints;
      updateConfig({
        api: {
          ...config.api,
          endpoints: {
            ...config.api.endpoints,
            [endpointKey]: value,
          },
        },
      });
    }
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
        <button className={`tab ${activeTab === 'theme' ? 'active' : ''}`} onClick={() => setActiveTab('theme')}>
          主题
        </button>
        <button
          className={`tab ${activeTab === 'typography' ? 'active' : ''}`}
          onClick={() => setActiveTab('typography')}
        >
          排版
        </button>
        <button className={`tab ${activeTab === 'layout' ? 'active' : ''}`} onClick={() => setActiveTab('layout')}>
          布局
        </button>
        <button
          className={`tab ${activeTab === 'animation' ? 'active' : ''}`}
          onClick={() => setActiveTab('animation')}
        >
          动画
        </button>
        <button className={`tab ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>
          API
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
              <input type="checkbox" id="darkMode" checked={config.theme.darkMode} onChange={handleToggleDarkMode} />
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

        {activeTab === 'api' && (
          <div className="api-settings">
            <div className="form-group">
              <label htmlFor="apiEnabled">启用API</label>
              <input
                type="checkbox"
                id="apiEnabled"
                checked={config.api.enabled}
                onChange={(e) => handleApiChange('enabled', e.target.checked)}
              />
              <p className="help-text">启用后将使用API获取数据，而不是本地存储。请确保API服务器已正确配置。</p>
            </div>

            <div className="form-group">
              <label htmlFor="apiBaseUrl">API基础URL</label>
              <input
                type="text"
                id="apiBaseUrl"
                value={config.api.baseUrl}
                onChange={(e) => handleApiChange('baseUrl', e.target.value)}
                placeholder="例如: http://localhost:8080"
              />
              <p className="help-text">API服务器的基础URL，不包含端点路径。为空即当前页面地址。</p>
            </div>

            <div className="form-group">
              <label htmlFor="apiMemoEndpoint">备忘录端点</label>
              <input
                type="text"
                id="apiMemoEndpoint"
                value={config.api.endpoints.memos}
                onChange={(e) => handleApiChange('endpoints.memos', e.target.value)}
                placeholder="例如: /api/memos"
              />
            </div>

            <div className="form-group">
              <label htmlFor="apiTagEndpoint">标签端点</label>
              <input
                type="text"
                id="apiTagEndpoint"
                value={config.api.endpoints.tags}
                onChange={(e) => handleApiChange('endpoints.tags', e.target.value)}
                placeholder="例如: /api/tags"
              />
            </div>

            <div className="api-test">
              <h3>API连接测试</h3>
              <button
                className="test-button"
                onClick={async () => {
                  try {
                    const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.memos}`, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    });

                    if (response.ok) {
                      alert('API连接成功！');
                    } else {
                      alert(`API连接失败: ${response.status} ${response.statusText}`);
                    }
                  } catch (error) {
                    alert(`API连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
                  }
                }}
                disabled={!config.api.enabled}
              >
                测试连接
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="config-actions">
        <button className="reset-button" onClick={resetToDefault}>
          重置为默认配置
        </button>
        <button className="export-button" onClick={downloadConfig}>
          导出配置
        </button>
        <button className="import-button" onClick={handleImportClick}>
          导入配置
        </button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".json" />
      </div>
      {importError && <div className="error-message">{importError}</div>}

      <style jsx>{`
        .config-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .back-link {
          color: ${config.theme.primaryColor};
          text-decoration: none;
        }

        .tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }

        .tab {
          padding: 10px 15px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          color: #666;
        }

        .tab.active {
          color: ${config.theme.primaryColor};
          border-bottom: 2px solid ${config.theme.primaryColor};
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }

        input[type='text'] {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .color-input {
          display: flex;
          align-items: center;
        }

        input[type='color'] {
          margin-right: 10px;
          width: 40px;
          height: 40px;
          border: none;
          cursor: pointer;
        }

        .config-actions {
          margin-top: 30px;
          display: flex;
          gap: 10px;
        }

        button {
          padding: 8px 16px;
          background-color: ${config.theme.primaryColor};
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .reset-button {
          background-color: #f44336;
        }

        .error-message {
          color: #f44336;
          margin-top: 10px;
        }

        .help-text {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }

        .api-test {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }

        .test-button {
          background-color: ${config.api.enabled ? config.theme.secondaryColor : '#ccc'};
          cursor: ${config.api.enabled ? 'pointer' : 'not-allowed'};
        }
      `}</style>
    </div>
  );
}
