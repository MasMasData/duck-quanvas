import React, { useEffect, useRef } from 'react';
import { Handle } from 'reactflow';
import Chart from 'chart.js/auto';

const ChartNode = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (data.chartData && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: data.chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Query Result Chart'
            }
          }
        },
      });
    }
  }, [data.chartData]);

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: 'white' }}>
      <Handle type="target" position="top" id="a" />
      <div>{data.label}</div>
      <canvas ref={chartRef} style={{ width: '100%', height: '250px' }}></canvas>
    </div>
  );
};

export default ChartNode;
