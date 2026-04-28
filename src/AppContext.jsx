import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [context, setContext] = useState('');
  const [drafts, setDrafts] = useState([]);

  return (
    <AppContext.Provider
      value={{
        leads, setLeads,
        selected, setSelected,
        context, setContext,
        drafts, setDrafts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppContext);
}
