import { useQuery } from '@tanstack/react-query';

interface DataItem {
  x: string;
  y: number;
}

const fetchChartData = async (url: string): Promise<DataItem[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data: any[] = await response.json();

  if (Array.isArray(data)) {
    const filteredWarnings = data.filter(item => item.type === 'WARNING');
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

export function useErrorCod(url: string) {
  return useQuery<DataItem[], Error>({
    queryKey: ['chartData', url],
    queryFn: () => fetchChartData(url),
    enabled: !!url, // Загружаем только если URL задан
  });
}
