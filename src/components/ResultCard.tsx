import type { ReactNode } from "react";
import { accentClasses, type Accent } from "./accents";

interface ResultCardProps {
  icon: string;
  title: string;
  accent: Accent;
  children: ReactNode;
}

export function ResultCard({ icon, title, accent, children }: ResultCardProps) {
  const c = accentClasses[accent];
  return (
    <section className={`rounded-[20px] border-2 bg-white p-5 ${c.card}`}>
      <h2
        className={`mb-3 flex items-center gap-2 font-display text-xl font-semibold ${c.title}`}
      >
        <span aria-hidden="true">{icon}</span> {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
