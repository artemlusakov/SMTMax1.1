// src/Pages/Statistics/AllError.tsx

import { create } from "zustand";

interface AllErrorState {
  errorData: { x: string; y: number }[];
  setErrorData: (data: { x: string; y: number }[]) => void;
  fetchErrorData: () => Promise<void>;
}

interface DataItemOperate {
  timestamp: string;
  level: string;
  message: string;
  feeder?: string;
  head?: string;
}

export const useAllError = create<AllErrorState>((set) => ({
  errorData: [],
  setErrorData: (data) => set({ errorData: data }),
  fetchErrorData: async () => {
    try {
      const response = await fetch('/path/to/Error.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let data: any = await response.json();
      
      // Проверяем, является ли data массивом
      if (!Array.isArray(data)) {
        console.error('Received data is not an array');
        set({ errorData: [] });
        return;
      }

      // Проверяем тип элементов в массиве
      if (!data.every(item => typeof item === 'object' && item !== null)) {
        console.error('Invalid data format: expected array of objects');
        set({ errorData: [] });
        return;
      }

      const errorCounts: Record<string, number> = {};

      data.forEach((error: DataItemOperate) => {
        const errorCode = error.message?.split('[')?.[0]?.trim();
        
        if (!errorCode || typeof errorCode !== 'string') {
          console.warn(`Invalid error message format: ${JSON.stringify(error)}`);
          return;
        }

        if (!errorCounts[errorCode]) {
          errorCounts[errorCode] = 0;
        }
        
        errorCounts[errorCode]++;
      });

      const formattedData = Object.entries(errorCounts).map(([x, y]) => ({ x, y }));
      set({ errorData: formattedData });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ errorData: [] });
    }
  },
}));