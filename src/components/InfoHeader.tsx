import { memo } from "react";
import { EmailIcon, GitHubIcon, LinkedInIcon } from "@/components/icons";

// App re-renders on every graph and list hover change and renders this header
// unconditionally; it takes no props, so memo makes those renders free.
export default memo(function InfoHeader() {
  return (
    <div className="flex justify-center md:justify-start items-center gap-4 text-2xl">
      <h1>Ben Galles</h1>
      <nav className="pointer-events-auto">
        <ul className="flex items-center gap-4">
          <li>
            <a
              href="https://github.com/jellybro99"
              target="_blank"
              aria-label="GitHub"
              className="hover:text-(--color-accent)"
            >
              <GitHubIcon />
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/ben-galles/"
              target="_blank"
              aria-label="LinkedIn"
              className="hover:text-(--color-accent)"
            >
              <LinkedInIcon />
            </a>
          </li>
          <li>
            {/* No target="_blank": a mailto hands off to the mail client, and
                a new tab would be left behind empty. */}
            <a
              href="mailto:benluke1111@gmail.com"
              aria-label="Email"
              className="hover:text-(--color-accent)"
            >
              <EmailIcon />
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
});
