import { MantineThemeOverride } from '@mantine/core';

// Custom theme configuration for Mantine
export const theme = {
  // Brand primary colors
  colors: {
    brand: [
      '#E6F7FF',
      '#BAE7FF',
      '#91D5FF',
      '#69C0FF',
      '#40A9FF',
      '#1890FF', // Primary color
      '#096DD9',
      '#0050B3',
      '#003A8C',
      '#002766',
    ],
  },
  
  // Default radius for elements
  defaultRadius: 'md',
  
  // Default props for components
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
      },
    },
    Avatar: {
      defaultProps: {
        radius: 'xl',
      },
    },
  },
  
  // Global styles
  globalStyles: (theme) => ({
    body: {
      backgroundColor: theme.colors.gray[0],
    },
  }),
  
  // Custom font family
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  
  // Color scheme
  colorScheme: 'light',
  
  // Custom spacing and sizes
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Shadows
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  
  // Other theme options
  other: {
    chatBubbleRadius: '16px',
    transitionDuration: '200ms',
  },
};

export default theme;