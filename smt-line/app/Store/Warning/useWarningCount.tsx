"use client";

import { create } from "zustand";

interface WarningCount {
    warningCount: number;
    setWarningCount: (value: number) => void;
    fetchWarningCount: () => void;
  }
interface DataItemError {     //Интерфейс для json файла
    timestamp: string;   //Время
    level: string;      //Состояние
    message: string;    //Сообщение
    feeder: string;     //Отдельный фидер

    head:string;
}

export const useWarningCount = create<WarningCount>((set) => ({
    warningCount: 0,
    setWarningCount:(value : number) => set({warningCount: value}),
    fetchWarningCount: async () => {
        try{
            const response = await fetch('./Error.json');
            const data: DataItemError[] = await response.json();
            
            if (Array.isArray(data)){
                const warnings = data.filter(item => item.level === 'WARNING');
                set({warningCount: warnings.length});
            }else {
                console.error('Received data is not an array');
                set({ warningCount: 0 });
              }
        }
        catch (error) {
            console.error('Error fetching data:', error);
          }
    },
}));