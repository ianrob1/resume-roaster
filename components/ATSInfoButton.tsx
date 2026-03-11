"use client";

export const ATS_EXPLANATION =
  "ATS (Applicant Tracking Systems) are software used by companies to filter resumes before a human sees them. Your score shows how likely your resume is to pass these filters and reach a real recruiter.";

export function ATSInfoButton() {
  return (
    <div className="group absolute top-2 right-2 z-10 flex flex-col items-end">
      <span
        aria-label="What is ATS?"
        className="flex h-3.5 w-3.5 shrink-0 cursor-help items-center justify-center rounded-full border border-white/50 bg-white/20 text-[9px] font-medium text-white transition hover:bg-white/30"
      >
        i
      </span>
      <div
        className="pointer-events-none absolute bottom-full left-full z-20 mb-1.5 ml-1 w-56 rounded-md border border-gray-200 bg-white p-2.5 text-left text-xs text-gray-800 shadow-lg opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100"
        role="tooltip"
      >
        {ATS_EXPLANATION}
      </div>
    </div>
  );
}

/** Small hover-only "i" for use on light backgrounds (e.g. hero stats). */
export function ATSInfoButtonLight() {
  return (
    <div className="group relative ml-1 inline-flex flex-col items-start align-top">
      <span
        aria-label="What is ATS?"
        className="flex h-3.5 w-3.5 shrink-0 cursor-help items-center justify-center rounded-full border border-foreground/25 bg-foreground/5 text-[9px] font-medium text-foreground/60 transition hover:border-[#e87b35] hover:bg-[#e87b35]/10 hover:text-[#e87b35]"
      >
        i
      </span>
      <div
        className="pointer-events-none absolute left-0 top-full z-10 mt-1 w-56 rounded-md border border-foreground/10 bg-white p-2.5 text-left text-xs text-foreground/90 shadow-lg opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100"
        role="tooltip"
      >
        {ATS_EXPLANATION}
      </div>
    </div>
  );
}
