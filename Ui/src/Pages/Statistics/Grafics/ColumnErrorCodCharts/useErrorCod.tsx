import { useQuery } from '@tanstack/react-query';

interface DataItem {
  x: string;
  y: number;
}

interface TimeRange {
  start?: string; // формат "YY/MM/DDTHH:mm:ss"
  end?: string;   // формат "YY/MM/DDTHH:mm:ss"
}

const fetchChartData = async (url: string, timeRange?: TimeRange): Promise<DataItem[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data: any[] = await response.json();

  if (Array.isArray(data)) {
    let filteredWarnings = data.filter(item => item.type === 'WARNING');

    if (timeRange?.start || timeRange?.end) {
      filteredWarnings = filteredWarnings.filter(item => {
        const itemTime = new Date(item.datetime).getTime();
        const startTime = timeRange.start ? new Date(timeRange.start).getTime() : 0;
        const endTime = timeRange.end ? new Date(timeRange.end).getTime() : Infinity;
        return itemTime >= startTime && itemTime <= endTime;
      });
    }

    const counts = filteredWarnings.reduce<{ [key: string]: number }>((acc, item) => {
      const code = item.message.match(/\[[a-zA-Z0-9]+\]/)?.[0].slice(1, -1) || '';
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([code, count]) => ({
      x: code,
      y: count,
    }));
  } else {
    throw new Error('Invalid data format');
  }
};

export function useErrorCod(url: string, timeRange?: TimeRange) {
  return useQuery<DataItem[], Error>({
    queryKey: ['chartData', url, timeRange],
    queryFn: () => fetchChartData(url, timeRange),
    enabled: !!url,
  });
}