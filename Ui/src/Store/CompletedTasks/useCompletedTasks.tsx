import { create } from "zustand";

interface DataItemOperate {
  datetime: string;
  message: string;
}

interface CompletedTasksState {
  completedTasks: number;
  setCompletedTasks: (value: number) => void;
  fetchCompletedTasks: (machineId: string) => Promise<void>;
  resetCompletedTasks: () => void;
}

export const useCompletedTasks = create<CompletedTasksState>((set) => ({
  completedTasks: 0,
  
  setCompletedTasks: (value: number) => set({ completedTasks: value }),
  
  fetchCompletedTasks: async (machineId: string) => {
    try {
      const OPERATE_JSON_URL = `../../${machineId}/Operate.json`;
      const response = await fetch(OPERATE_JSON_URL, { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DataItemOperate[] = await response.json();
      
      if (Array.isArray(data)) {
        const pcbRecords = data.filter(item => 
          item.message.includes('[LMEvent::RID_EVENT_PCB]')
        );
        set({ completedTasks: pcbRecords.length });
      } else {
        console.error('Received data is not an array');
        set({ completedTasks: 0 });
      }
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      set({ completedTasks: 0 });
    }
  },
  
  resetCompletedTasks: () => set({ completedTasks: 0 }),
}));