import { useState } from "react";
import { projects } from "@/assets/projects";
import Graph from "@/components/Graph";
import InfoHeader from "@/components/InfoHeader";
import ProjectList from "@/components/ProjectList";
import ProjectCard from "@/components/ProjectCard";

export default function App() {
  const [hovered, setHovered] = useState<number>(-1);
  const [popupId, setPopupId] = useState<number>(1);

  return (
    <div className="min-h-screen w-full text-primary">
      <div className="h-screen grid grid-cols-2 gap-2 p-2 bg-background">
        <header className="col-span-2 border border-primary bg-foreground">
          <InfoHeader />
        </header>
        <section className="min-h-0 w-full border border-primary bg-foreground">
          <ProjectList
            hovered={hovered}
            setHovered={setHovered}
            projects={projects}
          />
        </section>
        <section className="min-h-0 w-full border border-primary bg-foreground">
          <Graph
            hovered={hovered}
            setHovered={setHovered}
            projects={projects}
          />
        </section>
        {popupId != -1 && (
          <div className="absolute top-1/2 left-1/2,">
            <ProjectCard
              project={projects[popupId]}
              close={() => setPopupId(-1)}
            />
          </div>
        )}
      </div>
      <div className="h-screen">more stuff</div>
    </div>
  );
}
