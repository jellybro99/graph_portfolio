import { memo, useState } from "react";
import obsidianGraph from "@/assets/images/obsidian-graph.png";
import Popup from "@/components/Popup";

// App re-renders on every graph and list hover change and renders the about
// section unconditionally; nothing it renders depends on that hover state, so
// memo keeps the graph's overlay popup out of those renders.
export default memo(function AboutPage() {
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  return (
    // From md up the heading spans both columns, with text on the left and
    // the image on the right. Below md the source order holds, so "Here is my
    // beloved:" sits directly above the image.
    <div className="min-h-full pt-4 grid gap-6 md:grid-cols-2 md:gap-x-12">
      <h2 className="text-2xl md:col-span-2">About this project</h2>
      <div className="flex flex-col gap-6 md:self-end">
        <p>
          The graph above shows my projects. Click a node or a project name to
          see more.
        </p>
        <p>
          This project is inspired by Obsidian, a note-taking software which
          lets you link related notes and view them together as a graph. Here is
          my beloved:
        </p>
      </div>
      <img
        src={obsidianGraph}
        alt="An Obsidian vault shown as a graph of linked notes"
        onClick={() => setIsPopupOpen(true)}
        className="justify-self-center self-center max-h-96 cursor-zoom-in md:col-start-2 md:row-start-2 md:row-span-2 border-2 border-(--color-text) hover:border-(--color-accent)"
      />
      <div className="md:self-start">
        <p>This project includes:</p>
        <ul className="list-disc pl-4">
          <li>
            A prebuild step for creating blurred base64 images and processing
            projects before build time
          </li>
          <li>
            Nodes for each project sized based on GitHub commits, and linked
            based on technologies used
          </li>
          <li>
            A fully automated deployment pipeline using GitHub actions and
            GitHub pages
          </li>
        </ul>
      </div>

      <Popup
        title="Obsidian Graph"
        isOpen={isPopupOpen}
        close={() => setIsPopupOpen(false)}
      >
        <img
          src={obsidianGraph}
          alt="An Obsidian vault shown as a graph of linked notes"
          onClick={() => setIsPopupOpen(false)}
          className="cursor-zoom-out border-2 border-(--color-text) hover:border-(--color-accent)"
        />
      </Popup>
    </div>
  );
});
