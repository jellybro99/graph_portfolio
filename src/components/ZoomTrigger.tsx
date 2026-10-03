// Wraps an image that opens a zoomed view. A real button, so the zoom is
// reachable from the keyboard; it takes its accessible name from the wrapped
// image's alt text, so the image must carry one.
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
