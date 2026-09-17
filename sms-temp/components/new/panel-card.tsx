"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

/**
 * One section of the record panel. The panel stacks these in a single scroll
 * container — nesting a second scrollable area inside a card is what produced
 * the confusing double scrollbar.
 */
export function PanelCard({
  title,
  icon: Icon,
  meta,
  action,
  collapsible = false,
  defaultOpen = true,
  bodyClassName = "p-3",
  className = "",
  children
}: {
  title?: string;
  icon?: React.ElementType;
  /** Small right-aligned text, e.g. a count. */
  meta?: React.ReactNode;
  /** Right-aligned control shown in the header. */
  action?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  bodyClassName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const isOpen = !collapsible || open;

  return (
    <section className={`overflow-hidden rounded-xl border bg-card ${className}`}>
      {title && (
        <header className="flex items-center gap-2 border-b px-3 py-2">
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h3>
          <div className="ml-auto flex items-center gap-1.5">
            {meta && (
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {meta}
              </span>
            )}
            {action}
            {collapsible && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={isOpen}
                aria-label={`${isOpen ? "Collapse" : "Expand"} ${title}`}
                className="rounded p-0.5 text-muted-foreground transition hover:text-foreground"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>
        </header>
      )}
      {isOpen && <div className={bodyClassName}>{children}</div>}
    </section>
  );
}
