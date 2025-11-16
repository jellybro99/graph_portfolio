import Graph from './components/Graph.tsx';
import InfoHeader from './components/InfoHeader.tsx';
import ProjectList from './components/ProjectList.tsx';

export default function App() {
  return (
    <div className='min-h-screen w-full'>
      <div className='h-screen grid grid-cols-2 gap-2 p-2'>
        <header className='col-span-2 border-2'>
          <InfoHeader />
        </header>
        <section className='min-h-0 w-full border-2'>
          <ProjectList />
        </section>
        <section className='min-h-0 w-full border-2'>
          <Graph />
        </section>
      </div>
      <div className='h-screen'>
        more stuff
      </div>
    </div>
  )
}

