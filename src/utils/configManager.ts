import { AppConfig, defaultConfig } from '../types/config';

const CONFIG_STORAGE_KEY = 'ramblog-app-config';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 获取当前配置
   */
  public getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<AppConfig>): AppConfig {
    this.config = this.mergeConfigs(this.config, newConfig);
    this.saveConfig();
    return { ...this.config };
  }

  /**
   * 重置为默认配置
   */
  public resetToDefault(): AppConfig {
    this.config = { ...defaultConfig };
    this.saveConfig();
    return { ...this.config };
  }

  /**
   * 导出配置为JSON字符串
   */
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 从JSON字符串导入配置
   */
  public importConfig(jsonConfig: string): AppConfig {
    try {
      const parsedConfig = JSON.parse(jsonConfig);
      this.config = this.mergeConfigs(defaultConfig, parsedConfig);
      this.saveConfig();
      return { ...this.config };
    } catch (error) {
      console.error('配置导入失败:', error);
      return { ...this.config };
    }
  }

  /**
   * 下载配置为JSON文件
   */
  public downloadConfig(): void {
    const configJson = this.exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ramblog-config.json';
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  /**
   * 从本地存储加载配置
   */
  private loadConfig(): AppConfig {
    if (typeof window === 'undefined') {
      return { ...defaultConfig };
    }
    
    try {
      const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (storedConfig) {
        return this.mergeConfigs(defaultConfig, JSON.parse(storedConfig));
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
    
    return { ...defaultConfig };
  }

  /**
   * 保存配置到本地存储
   */
  private saveConfig(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  }

  /**
   * 合并配置，确保所有必要的字段都存在
   */
  private mergeConfigs(baseConfig: AppConfig, overrideConfig: Partial<any>): AppConfig {
    const merged = { ...baseConfig };
    
    // 递归合并对象
    const mergeObjects = (target: any, source: any) => {
      if (!source) return target;
      
      Object.keys(source).forEach(key => {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (target[key] === undefined) {
            target[key] = {};
          }
          mergeObjects(target[key], source[key]);
        } else if (source[key] !== undefined) {
          target[key] = source[key];
        }
      });
      
      return target;
    };
    
    return mergeObjects(merged, overrideConfig);
  }
} 