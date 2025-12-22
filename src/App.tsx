import { useState } from "react";
import projects from "@/assets/processedProjects.json";
import Graph from "@/components/Graph";
import InfoHeader from "@/components/InfoHeader";
import ProjectList from "@/components/ProjectList";
import ProjectCard from "@/components/ProjectCard";
import Popup from "@/components/Popup";
import AboutPage from "@/components/AboutPage";
import usePrefersDarkMode from "@/utils/usePrefersDarkMode";

export default function App() {
  const [hovered, setHovered] = useState<number>(-1);
  const [popupId, setPopupId] = useState<number>(-1);
  usePrefersDarkMode();

  return (
    <div className="min-h-screen p-4 w-full overflow-hidden bg-(--color-background) text-(--color-text)">
      <div className="h-screen relative flex flex-col items-center">
        <header className="max-w-5xl w-full z-10">
          <InfoHeader />
        </header>
        <div className="max-w-5xl w-full absolute top-10 text-center md:text-left z-10">
          <ProjectList
            hovered={hovered}
            setHovered={setHovered}
            projects={projects}
            setPopup={(nodeId) => setPopupId(nodeId)}
          />
        </div>
      </div>

      <div className="h-screen flex flex-col items-center">
        <div className="max-w-5xl w-full h-full">
          <AboutPage />
        </div>
      </div>

      <Graph
        hovered={hovered}
        setHovered={setHovered}
        setPopup={(nodeId) => setPopupId(nodeId)}
      />

      <Popup
        isOpen={popupId != -1}
        close={() => setPopupId(-1)}
        title={projects[popupId]?.title}
      >
        <ProjectCard project={projects[popupId]} />
      </Popup>
    </div>
  );
}
