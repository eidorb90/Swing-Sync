import { RadarChart } from '@mantine/charts';


export default function Radarchart() {
  return (
    <RadarChart
      h={300}
        data={[
            { product: 'A', sales: 120 },
            { product: 'B', sales: 98 },
            { product: 'C', sales: 86 },
            { product: 'D', sales: 99 },
            { product: 'E', sales: 85 },
        ]}
      dataKey="product"
      withPolarRadiusAxis
      series={[{ name: 'sales', color: 'blue.4', opacity: 0.2 }]}
    />
  );
}