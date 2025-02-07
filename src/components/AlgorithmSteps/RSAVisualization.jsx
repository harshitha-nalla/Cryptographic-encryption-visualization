import React from 'react';
import { Stage, Layer, Text, Arrow, Group, Rect } from 'react-konva';
import { Line } from 'react-chartjs-2';
import { Box } from '@mui/material';

const RSAVisualization = ({ step, data, width, height }) => {
  const renderPrimeNumbers = (x, y) => {
    return (
      <Group>
        <Text
          x={x}
          y={y - 25}
          text="Prime Numbers"
          fontSize={14}
          fill="#1976d2"
          fontStyle="bold"
        />
        <Rect
          x={x}
          y={y}
          width={120}
          height={60}
          fill="#e3f2fd"
          stroke="#1976d2"
          strokeWidth={1}
        />
        <Text
          x={x + 10}
          y={y + 10}
          text={`p = ${data.p}`}
          fontSize={12}
          fill="#000"
        />
        <Text
          x={x + 10}
          y={y + 30}
          text={`q = ${data.q}`}
          fontSize={12}
          fill="#000"
        />
      </Group>
    );
  };

  const renderModularExponentiation = () => {
    const chartData = {
      labels: data.steps.map((_, i) => i),
      datasets: [{
        label: 'Modular Exponentiation',
        data: data.steps,
        borderColor: '#1976d2',
        tension: 0.1
      }]
    };

    return (
      <Box width={width * 0.8} height={height * 0.6}>
        <Line data={chartData} options={{ responsive: true }} />
      </Box>
    );
  };

  const renderCurrentStep = () => {
    const centerX = width / 2;
    const centerY = height / 2;

    switch (step) {
      case 'primeSelection':
        return renderPrimeNumbers(centerX - 300, centerY);
      case 'modularExponentiation':
        return renderModularExponentiation();
      default:
        return null;
    }
  };

  return (
    <Stage width={width} height={height}>
      <Layer>
        {renderCurrentStep()}
      </Layer>
    </Stage>
  );
};

export default RSAVisualization;