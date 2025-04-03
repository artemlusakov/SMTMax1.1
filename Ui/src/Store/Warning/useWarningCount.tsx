import { create } from "zustand";

interface WarningCount {
    warningCount: number;
    setWarningCount: (value: number) => void;
    fetchWarningCount: (machineId: string) => void; // Добавляем параметр machineId
}

interface DataItemError {
    datetime: string;
    type: string;
    message: string;
    feeder: string;
    head: string;
    feederID: string;
    part: string;
}

export const useWarningCount = create<WarningCount>((set) => ({
    warningCount: 0,
    setWarningCount: (value: number) => set({ warningCount: value }),
    fetchWarningCount: async (machineId: string) => { // Принимаем machineId как параметр
        try {
            const ERROR_JSON_URL = `../../${machineId}/Error.json`;
            const response = await fetch(ERROR_JSON_URL);
            const data: DataItemError[] = await response.json();

            if (Array.isArray(data)) {
                const warnings = data.filter(item => item.type === 'WARNING');
                set({ warningCount: warnings.length });
            } else {
                console.error('Received data is not an array');
                set({ warningCount: 0 });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    },
}));