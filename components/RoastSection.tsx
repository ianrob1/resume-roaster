interface RoastSectionProps {
  text: string;
  title?: string;
}

export function RoastSection({ text, title = "Roast" }: RoastSectionProps) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-foreground/90">{text}</p>
    </div>
  );
}
