export interface AppConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    darkMode: boolean;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      heading1: string;
      heading2: string;
      heading3: string;
    };
    lineHeight: string;
  };
  layout: {
    contentWidth: string;
    sidebarWidth: string;
    headerHeight: string;
  };
  animation: {
    transitionSpeed: string;
  };
  api: {
    enabled: boolean;
    baseUrl: string;
    endpoints: {
      memos: string;
      tags: string;
    };
  };
}

export const defaultConfig: AppConfig = {
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    darkMode: false,
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      base: '16px',
      heading1: '2.25rem',
      heading2: '1.875rem',
      heading3: '1.5rem',
    },
    lineHeight: '1.5',
  },
  layout: {
    contentWidth: '1200px',
    sidebarWidth: '250px',
    headerHeight: '60px',
  },
  animation: {
    transitionSpeed: '0.2s',
  },
  api: {
    enabled: true,
    baseUrl: '',
    endpoints: {
      memos: '/api/memos',
      tags: '/api/tags',
    },
  },
};
