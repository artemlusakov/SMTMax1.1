"use client";

import { useEffect, useState } from 'react';

export default function testArr() {
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

  const [errorCounts, setErrorCounts] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/Error.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: DataItem[]) => {
        if (Array.isArray(data)) {
          const filteredWarnings = data.filter(item => item.level === 'WARNING');
          
          const counts = filteredWarnings.reduce<{ [key: string]: number }>(
            (acc, item) => {
              const code = item.message.match(/\[[a-zA-Z0-9]+\]/)?.[0].slice(1, -1) || '';
              acc[code] = (acc[code] || 0) + 1;
              return acc;
            },
            {}
          );

          setErrorCounts(counts);
        } else {
          console.error('Неверные данные: data не массив');
        }
      })
      .catch(error => console.error('Fetch error:', error))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      {/* Выводим уникальные коды ошибок */}
      {Object.entries(errorCounts).map(([code, count]) => (
        <div key={code}>
          <p>Код ошибки: {code}</p>
          <p>Количество ошибок: {count}</p>
        </div>
      ))}
    </div>
  );
}