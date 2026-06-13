import type { ReactNode } from "react";

interface ResultCardProps {
  icon: string;
  title: string;
  children: ReactNode;
}

export function ResultCard({ icon, title, children }: ResultCardProps) {
  return (
    <section className="rounded-2xl border border-green-100 bg-white p-5 shadow-md">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-green-800">
        <span aria-hidden="true">{icon}</span> {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
