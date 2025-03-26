import { useEffect, useState } from 'react';
import moment from 'moment';
import './DateAllWorks.css';

interface Props {
  url: string;
}

export default function DateAllWorks({ url }: Props) {
  const [startTime, setStartTime] = useState<string>('');   
  const [endTime, setEndTime] = useState<string>('');
  const [timeDifference, setTimeDifference] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const json: { datetime: string }[] = await response.json();
        
        if (!Array.isArray(json)) throw new Error('Неверный формат данных');
        if (json.length === 0) throw new Error('Нет данных для отображения');

        // Дата начала работы 
        const firstTimestamp = json[0].datetime;
        const startTimeMoment = moment(firstTimestamp, 'YYYY-MM-DD HH:mm:ss');
        setStartTime(startTimeMoment.format('DD.MM.YYYY HH:mm:ss'));

        // Конечная дата
        const endTimestamp = json[json.length - 1].datetime;
        const endTimeMoment = moment(endTimestamp, 'YYYY-MM-DD HH:mm:ss');
        setEndTime(endTimeMoment.format('DD.MM.YYYY HH:mm:ss'));

        // Расчет разницы времени
        const difference = endTimeMoment.diff(startTimeMoment);
        const duration = moment.duration(difference);
        
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        setTimeDifference(`${days} дн ${hours} ч ${minutes} мин ${seconds} сек`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        setStartTime('—');
        setEndTime('—');
        setTimeDifference('—');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  if (isLoading) {
    return (
      <div className="date-all-works loading">
        <div className="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="date-all-works error">
        <p className="error-message">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className="date-all-works">
      <div className="time-card">
        <div className="time-icon">⏱️</div>
        <div className="time-info">
          <h3>Время начала работы</h3>
          <p>{startTime}</p>
        </div>
      </div>
      
      <div className="time-card">
        <div className="time-icon">⏰</div>
        <div className="time-info">
          <h3>Время окончания работы</h3>
          <p>{endTime}</p>
        </div>
      </div>
      
      <div className="time-card highlight">
        <div className="time-icon">⏳</div>
        <div className="time-info">
          <h3>Общее время работы</h3>
          <p>{timeDifference}</p>
        </div>
      </div>
    </div>
  );
}