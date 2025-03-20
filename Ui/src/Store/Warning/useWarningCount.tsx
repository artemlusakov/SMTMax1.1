import { create } from "zustand";

interface WarningCount {
    warningCount: number;
    setWarningCount: (value: number) => void;
    fetchWarningCount: () => void;
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
    fetchWarningCount: async () => {
        try {
            const response = await fetch('../../../public/Error.json');
            const data: DataItemError[] = await response.json();

            if (Array.isArray(data)) {
                // Фильтруем данные по типу "WARNING"
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