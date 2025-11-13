import Graph from './components/Graph.tsx';
import InfoHeader from './components/InfoHeader.tsx';
import ProjectList from './components/ProjectList.tsx';

export default function App() {
  return (
    <div className='flex flex-col min-h-screen w-full'>
      <div className='h-screen'>
        <header>
          <InfoHeader />
        </header>
        <div className='flex flex-row'>
          <section className='basis-auto w-full'>
            <ProjectList />
          </section>
          <section className='basis-auto w-full'>
            <Graph />
          </section>
        </div>
      </div>
      <div className='h-screen'>
        more stuff
      </div>
    </div>
  )
}

