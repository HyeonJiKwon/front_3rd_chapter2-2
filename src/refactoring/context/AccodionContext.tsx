import { createContext, useContext, useState, ReactNode } from 'react';

interface AccordionContextProps {
  openProductIds: Set<string>;
  toggleProductAccordion: (productId: string) => void;
}

const AccordionContext = createContext<AccordionContextProps | undefined>(undefined);

export const AccordionProvider = ({ children }: { children: ReactNode }) => {
  const [openProductIds, setOpenProductIds] = useState<Set<string>>(new Set());

  const toggleProductAccordion = (productId: string) => {
    setOpenProductIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  return (
    <AccordionContext.Provider value={{ openProductIds, toggleProductAccordion }}>
      {children}
    </AccordionContext.Provider>
  );
};

export const useAccordion = (): AccordionContextProps => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an AccordionProvider');
  }
  return context;
};
