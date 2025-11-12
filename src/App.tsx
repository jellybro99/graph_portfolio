import Graph from './components/Graph.tsx';
import InfoHeader from './components/InfoHeader.tsx';
import ProjectList from './components/ProjectList.tsx';

export default function App() {
  return (
    <div className='flex flex-col h-screen w-screen'>
      <header className='h-12'>
        <InfoHeader />
      </header>
      <div className='flex md:flex-row flex-col'>
        <section className='basis-auto w-full'>
          <ProjectList />
        </section>
        <section className='basis-auto w-full'>
          <Graph />
        </section>
      </div>
    </div>
  )
}

