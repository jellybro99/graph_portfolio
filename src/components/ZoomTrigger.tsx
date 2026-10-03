// A button so the zoom works from the keyboard. Its accessible name comes from
// the wrapped image's alt text.
export default function ZoomTrigger({
  onClick,
  className,
  children,
}: {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={"cursor-zoom-in" + (className ? " " + className : "")}
    >
      {children}
    </button>
  );
}
