import React, { useEffect, useRef } from 'react';
import GenericNode from './GenericNode';
import Chart from 'chart.js/auto';
import { useResizeObserver } from '@mantine/hooks';

const ChartNode = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [containerRef, rect] = useResizeObserver();

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
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 20,
                font: {
                  size: 12
                }
              }
            },
            title: {
              display: true,
              text: 'Query Result Chart',
              font: {
                size: 16
              }
            }
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: 10
                }
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 10
                }
              }
            }
          }
        },
      });
    }
  }, [data.chartData, rect.width, rect.height]);

  return (
    <GenericNode data={{ ...data, hasInput: true, hasOutput: true }}>
      <div ref={containerRef} style={{ width: '600px', height: '450px' }}>
        <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>
      </div>
    </GenericNode>
  );
};

export default ChartNode;
