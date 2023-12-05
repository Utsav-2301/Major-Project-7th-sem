import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import socket from "../SocketService";

const ChartComponent = ({ measurementType }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    const labels = [];
    const data = {
      labels: labels,
      datasets: [
        {
          data: [],
          fill: false,
          label: "Measuring with Time",
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };

    let webSocketData = null;
    const config = {
      type: "line",
      data: data,
      options: {
        scales: {
          x: {
            type: "linear",
            title: {
              display: true,
              text: "Time (seconds)",
            },
          },
          y: {
            title: {
              display: true,
              text: `${measurementType
                .charAt(0)
                .toUpperCase()}${measurementType.slice(1)} Axis`,
            },
          },
        },
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                const dataPoint = context.dataset.data[context.dataIndex];
                const timestamp = dataPoint.x;
                const value = dataPoint.y;
                return `Time: ${timestamp}, Value: ${value.toFixed(2)}`;
              },
            },
          },
        },
        hover: {
          mode: "nearest",
          intersect: false,
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    let intervalId;
    let intervalSize = 1000;
    let currentTime = 0;

    function startUpdatingChart() {
      intervalId = setInterval(() => {
        if (webSocketData) {
          const dataValue = webSocketData.value;
          currentTime += 1;
          chartInstance.current.data.labels.push(currentTime);
          chartInstance.current.data.datasets[0].data.push({
            x: currentTime,
            y: dataValue,
          });
        }
        chartInstance.current.update();
      }, intervalSize);
    }

    socket.on("updateSensorData", function (data) {
      console.log("Received data:", data);
      webSocketData = data;
    });

    startUpdatingChart();

    return () => {
      clearInterval(intervalId);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [measurementType]);

  return (
    <div>
      <canvas ref={chartRef} id="chart2" width="600" height="250"></canvas>
    </div>
  );
};

export default ChartComponent;
