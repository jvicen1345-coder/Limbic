import { ChevronDownIcon } from "@/components/icons";

type CollapsibleCardProps = {
    title: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

export function CollapsibleCard({
    title,
    children,
    className = "",
    style,
}: CollapsibleCardProps) {
    return (
    <details className={`collapsible-card card elev-sm ${className}`} style={style}>
        <summary className="collapsible-card-summary">
            <span className="collapsible-card-title">{title}</span>
            <ChevronDownIcon size={18} className="collapsible-card-chevron" aria-hidden="true" />
        </summary>
        <div className="collapsible-card-content">{children}</div>
    </details>
    );
}
