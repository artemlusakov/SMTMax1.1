import React, { useEffect } from 'react';

interface DataItem {
  timestamp: string;
  level: string;
  message: string;
  feeder?: string;
  head?: string;
  type?: string;
  event?: string;
  part?: string;
}

const getErrorCodeFromMessage = (message: string): string | null => {
  const warningMatch = message.match(/<WARNING>/);
  const freezeMatch = message.match(/<FREEZE>/);

  if (warningMatch || freezeMatch) {
    const match = message.match(/\[(\w+)\]/);
    return match ? match[1] : null;
  }
  return null;
};

const TreemMapArr = () => {
  const [data, setData] = React.useState<{ x: string; y: number }[]>([]);

  useEffect(() => {
    fetch('/Error.json')
      .then(response => response.json())
      .then((data: DataItem[]) => {
        if (Array.isArray(data)) {
          const errorCountMap = new Map<string, number>();

          data.forEach(item => {
            const errorCode = getErrorCodeFromMessage(item.message);
            if (errorCode) {
              errorCountMap.set(errorCode, (errorCountMap.get(errorCode) || 0) + 1);
            }
          });

          const result = Array.from(errorCountMap.entries()).map(([x, y]) => ({ x, y }));
          setData(result);
        } else {
          console.error('Неверные данные: data не массив');
        }
      });
  }, []);

  return data;
};

export default TreemMapArr;