interface RoastSectionProps {
  text: string;
  title?: string;
  iconSrc?: string;
}

export function RoastSection({ text, title = "Roast", iconSrc }: RoastSectionProps) {
  return (
    <div className="rounded-2xl border-2 border-foreground/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2">
        {iconSrc && (
          <img
            src={iconSrc}
            alt=""
            className="h-6 w-6 object-contain icon-tint-orange"
            width={24}
            height={24}
          />
        )}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-foreground/90">{text}</p>
    </div>
  );
}
