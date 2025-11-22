import { useState } from "react";
import { projects } from "@/assets/projects";
import Graph from "@/components/Graph";
import InfoHeader from "@/components/InfoHeader";
import ProjectList from "@/components/ProjectList";
import ProjectCard from "@/components/ProjectCard";

export default function App() {
  const [hovered, setHovered] = useState<number>(-1);
  const [popupId, setPopupId] = useState<number>(-1);

  return (
    <div className="min-h-screen w-full flex flex-col items-center">
      <div className="h-screen w-2xl">
        <header className="absolute">
          <InfoHeader />
        </header>
        <section className="absolute top-1/3 opacity-80 text-sm">
          <ProjectList
            hovered={hovered}
            setHovered={setHovered}
            projects={projects}
          />
        </section>
        <section className="w-full h-full">
          <Graph
            hovered={hovered}
            setHovered={setHovered}
            projects={projects}
            setPopup={(nodeId: number) => setPopupId(nodeId)}
          />
        </section>
        {popupId != -1 && (
          <div className="fixed inset-0 flex items-center justify-center bg-foreground opacity-80">
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
