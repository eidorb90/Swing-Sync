import ReactDOM from 'react-dom';
import { Radar } from '../../Radar';
import { data } from './data';

const rootElement = document.getElementById('root');
ReactDOM.render(
  <Radar
    data={data}
    width={500}
    height={500}
    axisConfig={[
      { name: 'speed', max: 10 },
      { name: 'acceleration', max: 10 },
      { name: 'conso', max: 10 },
      { name: 'safety', max: 2 },
      { name: 'style', max: 1000 },
      { name: 'price', max: 100 },
    ]}
  />,
  rootElement
);
