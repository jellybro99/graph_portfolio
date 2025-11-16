import Graph from './components/Graph.tsx';
import InfoHeader from './components/InfoHeader.tsx';
import ProjectList from './components/ProjectList.tsx';

export default function App() {
  return (
    <div className='min-h-screen w-full text-primary'>
      <div className='h-screen grid grid-cols-2 gap-2 p-2 bg-background'>
        <header className='col-span-2 border border-primary bg-foreground'>
          <InfoHeader />
        </header>
        <section className='min-h-0 w-full border border-primary bg-foreground'>
          <ProjectList />
        </section>
        <section className='min-h-0 w-full border border-primary bg-foreground'>
          <Graph />
        </section>
      </div>
      <div className='h-screen'>
        more stuff
      </div>
    </div>
  )
}

