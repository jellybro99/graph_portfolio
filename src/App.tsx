import Graph from './Graph.tsx';
import InfoHeader from './InfoHeader.tsx';

export default function App() {
  return (
    <div className='flex flex-col'>
      <InfoHeader />
      <div className='border-2 border-black border-solid'>
        <Graph />
      </div>
    </div>
  )
}

