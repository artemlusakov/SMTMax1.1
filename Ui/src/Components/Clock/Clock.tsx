import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function formatDateTime(date : any) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

export default function Clock({ prefix = "Текущая смена:" }) {
  const [time, setTime] = useState(formatDateTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatDateTime(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {prefix} {time}
    </div>
  );
}

Clock.propTypes = {
  prefix: PropTypes.string
};