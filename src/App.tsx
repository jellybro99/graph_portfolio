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
    <div className="min-h-screen w-full">
      {/* page 1 */}
      <div className="h-screen relative flex flex-col items-center">
        <header className="max-w-3xl w-full z-10">
          <InfoHeader />
        </header>
        <div className="max-w-3xl w-full absolute top-1/4 z-10">
          <ProjectList
            hovered={hovered}
            setHovered={setHovered}
            projects={projects}
          />
        </div>
        <section className="absolute inset-0">
          <Graph
            hovered={hovered}
            setHovered={setHovered}
            projects={projects}
            setPopup={(nodeId) => setPopupId(nodeId)}
          />
        </section>
      </div>

      {/* page 2 */}
      <div className="h-screen flex flex-col items-center">
        <div className="max-w-3xl w-full h-full">more stuff</div>
      </div>

      {/* popup */}
      {popupId != -1 && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-foreground opacity-80">
          <ProjectCard
            project={projects[popupId]}
            close={() => setPopupId(-1)}
          />
        </div>
      )}
    </div>
  );
}
