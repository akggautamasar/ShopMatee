
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TemplateContextType {
  selectedTemplate: string | null;
  setSelectedTemplate: (templateId: string | null) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};

interface TemplateProviderProps {
  children: ReactNode;
}

export const TemplateProvider = ({ children }: TemplateProviderProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('classic');

  return (
    <TemplateContext.Provider value={{ selectedTemplate, setSelectedTemplate }}>
      {children}
    </TemplateContext.Provider>
  );
};
