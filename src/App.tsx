import { useCallback, useMemo, useState } from "react";
import projects from "@/assets/processedProjects.json";
import Graph from "@/components/Graph";
import InfoHeader from "@/components/InfoHeader";
import ProjectList from "@/components/ProjectList";
import ProjectCard from "@/components/ProjectCard";
import Popup from "@/components/Popup";
import AboutPage from "@/components/AboutPage";
import useApplyDarkModeClass from "@/utils/useApplyDarkModeClass";
import resolveHovered from "@/utils/resolveHovered";

export default function App() {
  const [graphHover, setGraphHover] = useState<number>(-1);
  const [listHover, setListHover] = useState<number>(-1);
  const [overGraph, setOverGraph] = useState(false);
  const [overList, setOverList] = useState(false);
  const [popupId, setPopupId] = useState<number>(-1);
  useApplyDarkModeClass();

  const hovered = resolveHovered(overGraph, graphHover, overList, listHover);

  const popupProject = projects.find((project) => project.id === popupId);

  // Hover changes re-render App many times a second, and anything rebuilt on
  // those renders re-renders with it. Keep the handlers and the popup's child
  // element stable so the churn stops at the list that highlights from it.
  const openPopup = useCallback((nodeId: number) => setPopupId(nodeId), []);
  const closePopup = useCallback(() => setPopupId(-1), []);
  const popupContent = useMemo(
    () => (popupProject ? <ProjectCard project={popupProject} /> : null),
    [popupProject],
  );

  return (
    <div className="min-h-screen w-full min-w-80 p-4 overflow-hidden bg-(--color-background) text-(--color-text)">
      <div className="h-screen relative flex flex-col items-center">
        <header className="max-w-5xl w-full z-10">
          <InfoHeader />
        </header>
        <div className="max-w-5xl w-full absolute top-10 text-center md:text-left z-10 pointer-events-none">
          <div className="inline-block pointer-events-auto">
            <ProjectList
              hovered={hovered}
              setHovered={setListHover}
              setOverList={setOverList}
              projects={projects}
              setPopup={openPopup}
            />
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center">
        <div className="max-w-5xl min-h-full">
          <AboutPage />
        </div>
      </div>

      <Graph
        hovered={hovered}
        setHovered={setGraphHover}
        setOverGraph={setOverGraph}
        setPopup={openPopup}
      />

      <Popup
        isOpen={popupId != -1}
        close={closePopup}
        title={popupProject?.title}
      >
        {popupContent}
      </Popup>
    </div>
  );
}
