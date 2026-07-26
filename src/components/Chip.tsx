export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={active ? "tag tag-accent filter-chip" : "tag tag-outline filter-chip"} onClick={onClick}>
      {children}
    </button>
  );
}
