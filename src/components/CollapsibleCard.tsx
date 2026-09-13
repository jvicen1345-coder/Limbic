import { ChevronDownIcon } from "@/components/icons";

type CollapsibleCardProps = {
    title: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    /** Native exclusive `<details>` group. Omit for standalone cards. */
    name?: string;
};

export function CollapsibleCard({
    title,
    children,
    className = "",
    style,
    name,
}: CollapsibleCardProps) {
    return (
    <details className={`collapsible-card card elev-sm ${className}`} style={style} name={name}>
        <summary className="collapsible-card-summary">
            <span className="collapsible-card-title">{title}</span>
            <ChevronDownIcon size={18} className="collapsible-card-chevron" aria-hidden="true" />
        </summary>
        <div className="collapsible-card-content">{children}</div>
    </details>
    );
}
