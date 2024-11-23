import React from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';
import "./ErrorChart.css";

const ErrorChart: React.FC<{ data: Array<{ name: string; children: Array<{ name: string; size: number }> }> }> = ({ data }) => {
  const getFillColor = (size: number | undefined): string => {
    if (size !== undefined && size > 1500) return '#ff0000';
    else if (size !== undefined && size >= 1000) return '#ffa500';
    else return '#2da72d';
  };

  const formatEntryString = (name: string, size: number | undefined): string => {
    const formattedSize = size !== undefined ? size.toString().padStart(4, ' ') : '';
    return `${name}\n${formattedSize} errors`;
  };

  const renderText = (entry: any, fontSize: number) => {
    const entryWidth = entry.width;
    const entryHeight = entry.height;
    const size = entry.value || 0; // Убедитесь, что size всегда определен

    if (entryWidth <= 70 && entryHeight > 70 ) {
      // Для маленьких элементов делаем диагональную запись
      return React.createElement(
        'g',
        null,
        React.createElement('path', {
          d: `M${entry.x},${entry.y} L${entry.x + entryWidth},${entry.y + entryHeight}`,
          stroke: 'white',
          strokeWidth: 0
        }),
        React.createElement('text', {
          x: entry.x + entryWidth / 2,
          y: entry.y + entryHeight / 2,
          textAnchor: 'middle',
          dominantBaseline: 'middle',
          fontSize: `50%`,
          fill: "#fff",
          transform: `rotate(90 ${entry.x + entryWidth / 2} ${entry.y + entryHeight / 2})`
        }, formatEntryString(entry.name, size))
      );
    }
    else if (entryWidth <= 70 && entryHeight <= 70 ){
      // Для маленьких элементов делаем диагональную запись
      return React.createElement(
        'g',
        null,
        React.createElement('path', {
          d: `M${entry.x},${entry.y} L${entry.x + entryWidth},${entry.y + entryHeight}`,
          stroke: 'white',
          strokeWidth: 0
        }),
        React.createElement('text', {
          x: entry.x + entryWidth / 2,
          y: entry.y + entryHeight / 2,
          textAnchor: 'middle',
          dominantBaseline: 'middle',
          fontSize: `30%`,
          fill: "#fff",
          transform: `rotate(90 ${entry.x + entryWidth / 2} ${entry.y + entryHeight / 2})`
        }, formatEntryString(entry.name, size))
      );
    }
    else if (entryWidth <= 100){
      return React.createElement(
        'text', {
          x: entry.x + entryWidth / 2,
          y: entry.y + entryHeight / 2,
          textAnchor: 'middle',
          dominantBaseline: 'middle',
          fontSize: `30%`,
          fill: "#fff"
        }, formatEntryString(entry.name, size))
    }
    else {
      // Для обычных элементов делаем горизонтальную запись
      return React.createElement(
        'text', {
          x: entry.x + entryWidth / 2,
          y: entry.y + entryHeight / 2,
          textAnchor: 'middle',
          dominantBaseline: 'middle',
          fontSize: `80%`,
          fill: "#fff"
        }, formatEntryString(entry.name, size))
    };
  };

  return (
    <ResponsiveContainer className="ResponsiveContainer" width="100%" height="100%">
      <Treemap 
        className='TreemapStyle'
        width={400} 
        height={200} 
        data={data}
        dataKey="size"
        aspectRatio={3 / 4}
        stroke="#fff"
        content={(entry) => {
          const size = entry.value || 0; // Убедитесь, что size всегда определен
          const fontSize = "";
          const textColor = "#fff";
          return React.createElement(
            'g',
            null,
            React.createElement('rect', {
              x: entry.x,
              y: entry.y,
              width: entry.width,
              height: entry.height,
              fill: getFillColor(size)
            }),
            renderText(entry, size, fontSize, textColor)
          );
        }}
      />
    </ResponsiveContainer>
  );
};

export default ErrorChart;