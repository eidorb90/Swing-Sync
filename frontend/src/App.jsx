import React from 'react';
import { RadarChart } from '@mantine/charts';
import { Container, Title } from '@mantine/core';
import { data } from './data';

export default function App() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="lg">Golf Performance Analytics</Title>
      <RadarChart
        h={400}
        data={data}
        dataKey="product"
        withPolarRadiusAxis
        series={[
          { name: 'Current Skills', color: 'blue.6' },
          { name: 'Target Skills', color: 'teal.6' },
        ]}
      />
    </Container>
  );
}


