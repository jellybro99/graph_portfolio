import { useState } from "react";
import { projects } from "@/assets/projects";
import Graph from "@/components/Graph";
import InfoHeader from "@/components/InfoHeader";
import ProjectList from "@/components/ProjectList";
import ProjectCard from "@/components/ProjectCard";
import Popup from "@/components/Popup";
import usePrefersDarkMode from "./utils/usePrefersDarkMode";

export default function App() {
  const [hovered, setHovered] = useState<number>(-1);
  const [popupId, setPopupId] = useState<number>(-1);
  usePrefersDarkMode();

  return (
    <div className="min-h-screen w-full bg-(--color-background) text-(--color-text)">
      {/* page 1 */}
      <div className="h-screen relative flex flex-col items-center">
        <header className="max-w-5xl w-full z-10">
          <InfoHeader />
        </header>
        <div className="max-w-5xl w-full absolute top-1/4 z-10">
          <ProjectList
            hovered={hovered}
            setHovered={setHovered}
            projects={projects}
            setPopup={(nodeId) => setPopupId(nodeId)}
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
        <div className="max-w-5xl w-full h-full">more stuff</div>
      </div>

      {/* popup */}
      {popupId != -1 && (
        <Popup close={() => setPopupId(-1)}>
          <ProjectCard project={projects[popupId]} />
        </Popup>
      )}
    </div>
  );
}
