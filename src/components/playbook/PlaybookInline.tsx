import { Fragment } from "react";
import { parsePlaybookInline } from "@/lib/playbook-inline";

/** Renders a playbook's inline markup (see lib/playbook-inline.ts) as JSX. The parser
 *  returns plain data, never HTML, so nothing here needs dangerouslySetInnerHTML. */
export function PlaybookInline({ text }: { text: string }) {
  return (
    <>
      {parsePlaybookInline(text).map((node, i) => {
        switch (node.type) {
          case "strong":
            return <strong key={i}>{node.text}</strong>;
          case "em":
            return <em key={i}>{node.text}</em>;
          case "pill":
            return (
              <span key={i} className={`playbook-pill playbook-pill-${node.tone}`}>
                {node.text}
              </span>
            );
          case "break":
            return <br key={i} />;
          default:
            return <Fragment key={i}>{node.text}</Fragment>;
        }
      })}
    </>
  );
}
