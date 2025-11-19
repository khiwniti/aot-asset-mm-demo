// Simple Tabs Component

import React, { ReactNode } from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <div>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps & { value?: string; onValueChange?: (v: string) => void }> = ({ 
  children, 
  className = '',
  value,
  onValueChange
}) => {
  return (
    <div className={`flex border-b border-gray-200 bg-gray-50 ${className}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps & { value?: string; onValueChange?: (v: string) => void }> = ({ 
  value: triggerValue,
  children,
  className = '',
  value,
  onValueChange
}) => {
  const isActive = value === triggerValue;

  return (
    <button
      onClick={() => onValueChange?.(triggerValue)}
      className={`
        px-4 py-3 font-medium text-sm transition-colors
        ${isActive
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-800'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps & { value?: string; onValueChange?: (v: string) => void }> = ({ 
  value: contentValue,
  children,
  className = '',
  value
}) => {
  if (value !== contentValue) return null;

  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};
