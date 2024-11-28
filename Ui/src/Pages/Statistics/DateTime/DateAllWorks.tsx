import React, { useEffect, useState } from 'react';
import moment from 'moment';

export default function DateAllWorks() {

  const [startTime, setStartTime] = useState<string>('');   
  const [endTime, setEndTime] = useState<string>('');
  const [timeDifference, setTimeDifference] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/Operate.json')
      .then(response => response.json())
      .then((json: { datetime: string }[]) => {
        if (Array.isArray(json) && json.length > 0) {
          // Дата начала работы 
          const firstTimestamp = json[0].datetime;
          const startTimeMoment = moment(firstTimestamp, 'YYYY-MM-DD HH:mm:ss');
          setStartTime(startTimeMoment.format('YYYY-MM-DD HH:mm:ss'));

          // Конечная дата
          const endTimestamp = json[json.length - 1].datetime;
          const endTimeMoment = moment(endTimestamp, 'YYYY-MM-DD HH:mm:ss');
          setEndTime(endTimeMoment.format('YYYY-MM-DD HH:mm:ss'));

          // Расчет разницы времени
          const difference = endTimeMoment.diff(startTimeMoment);
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          // Формирование переменной для вывода разницы
          setTimeDifference(`${days} дн ${hours} ч ${minutes} мин ${seconds} сек`);
        } else {
          console.error('Неверные данные или отсутствуют записи в JSON');
          setStartTime('Некорректные данные');
          setEndTime('Некорректные данные');
          setTimeDifference('Неверные данные');
        }
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h3>Время начала работы: {startTime}</h3>
      <h3>Время конца работы: {endTime}</h3>
      <h3>Разница времени: {timeDifference}</h3>
    </div>
  );
}