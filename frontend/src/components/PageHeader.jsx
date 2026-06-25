import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, subtitle, icon: Icon, className, action }) {
  return (
    <div className={cn("flex items-start justify-between gap-6 animate-fade-up", className)}>
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-3">
            {Icon && (
              <span className="grid place-items-center h-9 w-9 rounded-xl glass-gold text-amber-300">
                <Icon size={18} />
              </span>
            )}
            <span className="text-[0.7rem] uppercase tracking-[0.32em] text-amber-300/80 font-semibold">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-semibold text-stone-100">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm md:text-[0.95rem] text-stone-400 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export default PageHeader;
