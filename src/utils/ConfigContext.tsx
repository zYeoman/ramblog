'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, defaultConfig } from '../types/config';
import { ConfigManager } from './configManager';

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  resetToDefault: () => void;
  exportConfig: () => string;
  importConfig: (jsonConfig: string) => void;
  downloadConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [configManager, setConfigManager] = useState<ConfigManager | null>(null);

  // 初始化配置管理器
  useEffect(() => {
    // 确保只在客户端运行
    if (typeof window !== 'undefined') {
      const manager = ConfigManager.getInstance();
      setConfigManager(manager);
      setConfig(manager.getConfig());
    }
  }, []);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    if (configManager) {
      const updatedConfig = configManager.updateConfig(newConfig);
      setConfig(updatedConfig);
    }
  };

  const resetToDefault = () => {
    if (configManager) {
      const defaultConfig = configManager.resetToDefault();
      setConfig(defaultConfig);
    }
  };

  const exportConfig = (): string => {
    if (configManager) {
      return configManager.exportConfig();
    }
    return '';
  };

  const importConfig = (jsonConfig: string) => {
    if (configManager) {
      const updatedConfig = configManager.importConfig(jsonConfig);
      setConfig(updatedConfig);
    }
  };

  const downloadConfig = () => {
    if (configManager) {
      configManager.downloadConfig();
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        updateConfig,
        resetToDefault,
        exportConfig,
        importConfig,
        downloadConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
