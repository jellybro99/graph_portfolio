import { useState } from "react";
import obsidianGraph from "@/assets/images/obsidian-graph.png";
import Popup from "@/components/Popup";

export default function AboutPage() {
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  return (
    <div className="flex flex-col items-center md:items-stretch">
      <h1 className="text-center md:text-left text-2xl">More Stuff</h1>
      <p className="max-w-xl text-center md:text-left">
        This project is inspired by obsidian, a note-taking software which lets
        you link related notes and view them together as a graph. Here is my
        beloved:
      </p>
      <img
        src={obsidianGraph}
        onClick={() => setIsPopupOpen(true)}
        className="self-center h-96 cursor-zoom-in border-2 border-(--color-text) hover:border-(--color-accent)"
      />
      <p className="text-center md:text-left">This project includes:</p>
      <ul className="list-disc pl-4 max-w-xl">
        <li>
          A prebuild step for creating blurred base64 images and processing
          projects before build time
        </li>
        <li>
          Nodes for each project sized based on GitHub commits, and linked based
          on technologies used
        </li>
        <li>
          A fully automated deployment pipeline using GitHub actions and GitHub
          pages
        </li>
      </ul>

      {!isMobile && (
        <Popup
          title="Obsidian Graph"
          isOpen={isPopupOpen}
          close={() => setIsPopupOpen(false)}
        >
          <img
            src={obsidianGraph}
            onClick={() => setIsPopupOpen(false)}
            className="cursor-zoom-out border-2 border-(--color-text) hover:border-(--color-accent)"
          />
        </Popup>
      )}
    </div>
  );
}
