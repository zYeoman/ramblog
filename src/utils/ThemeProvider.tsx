'use client';

import React, { ReactNode } from 'react';
import { useConfig } from './ConfigContext';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { config } = useConfig();
  const { theme, typography, animation } = config;

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-color: ${theme.primaryColor};
          --secondary-color: ${theme.secondaryColor};
          --background-color: ${theme.backgroundColor};
          --text-color: ${theme.textColor};
          --font-family: ${typography.fontFamily};
          --font-size-base: ${typography.fontSize.base};
          --font-size-h1: ${typography.fontSize.heading1};
          --font-size-h2: ${typography.fontSize.heading2};
          --font-size-h3: ${typography.fontSize.heading3};
          --line-height: ${typography.lineHeight};
          --content-width: ${config.layout.contentWidth};
          --sidebar-width: ${config.layout.sidebarWidth};
          --header-height: ${config.layout.headerHeight};
          --transition-speed: ${animation.transitionSpeed};
        }

        body {
          font-family: var(--font-family);
          font-size: var(--font-size-base);
          line-height: var(--line-height);
          color: var(--text-color);
          background: var(--background-color);
          transition: background-color var(--transition-speed), color var(--transition-speed);
        }

        h1 {
          font-size: var(--font-size-h1);
        }

        h2 {
          font-size: var(--font-size-h2);
        }

        h3 {
          font-size: var(--font-size-h3);
        }

        a {
          color: var(--primary-color);
          transition: color var(--transition-speed);
        }

        a:hover {
          color: var(--secondary-color);
        }

        button {
          transition: background-color var(--transition-speed), color var(--transition-speed);
        }
      `}</style>
      {children}
    </>
  );
};
