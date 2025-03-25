import { useState, useMemo } from 'react';
import { useErrorCod } from './useErrorCod';
import Chart from 'react-apexcharts';
import './ColumnErrorCodCharts.css';
import { getErrorDescription } from '../../../../Store/Warning/WarningDescription';

interface Props {
  url: string;
}

export default function ColumnErrorCodCharts({ url }: Props) {
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timeRange, setTimeRange] = useState<{ start?: string; end?: string }>({});

  const { data: allData, isLoading, isError } = useErrorCod(url, timeRange);

  // Автоматическое форматирование даты (YY/MM/DD)
  const formatDateInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 6)}`;
  };

  // Автоматическое форматирование времени (HH:mm:ss)
  const formatTimeInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(formatDateInput(e.target.value));
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(formatTimeInput(e.target.value));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(formatDateInput(e.target.value));
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(formatTimeInput(e.target.value));
  };

  const applyTimeFilter = () => {
    const start = startDate && startTime ? `20${startDate}T${startTime}` : undefined;
    const end = endDate && endTime ? `20${endDate}T${endTime}` : undefined;
    setTimeRange({ start, end });
  };

  const resetTimeFilter = () => {
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setTimeRange({});
  };

  // Мемоизируем данные с учетом сортировки и лимита
  const sortedData = useMemo(() => {
    if (!allData) return [];
    const sorted = [...allData].sort((a, b) => (sortOrder === 'asc' ? a.y - b.y : b.y - a.y));
    return limit === Infinity ? sorted : sorted.slice(0, limit);
  }, [allData, sortOrder, limit]);

  if (isLoading) return <div>Загрузка...</div>;
  if (isError) return <div>Произошла ошибка при загрузке данных.</div>;

  return (
    <div>
      <div className="time-filter">
        <div className="time-input-group">
          <label>Начало:</label>
          <input
            type="text"
            placeholder="YY/MM/DD"
            value={startDate}
            onChange={handleStartDateChange}
            maxLength={8}
          />
          <input
            type="text"
            placeholder="HH:mm:ss"
            value={startTime}
            onChange={handleStartTimeChange}
            maxLength={8}
          />
        </div>
        <div className="time-input-group">
          <label>Конец:</label>
          <input
            type="text"
            placeholder="YY/MM/DD"
            value={endDate}
            onChange={handleEndDateChange}
            maxLength={8}
          />
          <input
            type="text"
            placeholder="HH:mm:ss"
            value={endTime}
            onChange={handleEndTimeChange}
            maxLength={8}
          />
        </div>


        <div className="filter-buttons">
          <div className='filter-buttons-column'>
            <button onClick={applyTimeFilter}>Применить</button>
            <button onClick={resetTimeFilter}>Сбросить</button>
          </div>
          {[5, 10, 15, 20].map(limitOption => (
            <button
              key={limitOption}
              onClick={() => setLimit(limitOption)}
              className={limit === limitOption ? 'active' : ''}
            >
              Top {limitOption}
            </button>
          ))}
          <button
            onClick={() => setLimit(Infinity)}
            className={limit === Infinity ? 'active' : ''}
          >
            All
          </button>
        </div>
        <div className="sort-buttons">
          <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
            Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
          </button>
        </div>
      </div>

      <Chart
        options={{
          tooltip: {
            custom: ({ dataPointIndex }) => {
              const error = sortedData[dataPointIndex];
              return `
                <div class="tooltip">
                  <strong>${error.x}</strong>: ${error.y} ошибок<br>
                  ${getErrorDescription(error.x) || 'Описание отсутствует'}
                </div>
              `;
            }
          },
          xaxis: { categories: sortedData.map(d => d.x) }
        }}
        series={[{ data: sortedData.map(d => d.y) }]}
        type="bar"
        height={"100%"}
      />
    </div>
  );
}