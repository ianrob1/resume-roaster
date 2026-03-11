import { ATSInfoButtonLight } from "@/components/ATSInfoButton";

interface ScoreCardProps {
  score: number;
  label?: string;
}

export function ScoreCard({ score, label = "ATS Compatibility Score" }: ScoreCardProps) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-foreground/70 inline-flex items-center gap-1">
        {label}
        <ATSInfoButtonLight />
      </p>
      <p className="mt-2 text-4xl font-bold text-foreground">
        {score} <span className="text-2xl font-normal text-foreground/60">/ 100</span>
      </p>
    </div>
  );
}
