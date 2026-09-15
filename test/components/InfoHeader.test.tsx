import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen, within } from "@testing-library/react";
import InfoHeader from "../../src/components/InfoHeader";

afterEach(cleanup);

describe("InfoHeader", () => {
  it("points the email icon at a complete address", () => {
    const { container } = render(<InfoHeader />);

    const email = container.querySelector('a[href^="mailto:"]');
    if (!email) throw new Error("InfoHeader rendered no mailto link");

    // A mailto with no domain opens a mail client with nowhere to send.
    expect(email.getAttribute("href")).toMatch(
      /^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i,
    );
  });

  it("keeps the heading out of the icon list and the icons in a nav landmark", () => {
    render(<InfoHeader />);

    const heading = screen.getByRole("heading", { name: "My Portfolio" });
    // Only li elements may be children of a ul, so the h1 must not sit in it.
    expect(heading.closest("ul")).toBeNull();

    const nav = screen.getByRole("navigation");
    expect(within(nav).getAllByRole("link")).toHaveLength(3);
  });
});
