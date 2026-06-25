import { cn } from "@/lib/utils";

export function Field({ label, suffix, prefix, className, ...props }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400 mb-2">
        {label}
      </span>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3.5 text-stone-500 text-sm pointer-events-none">{prefix}</span>
        )}
        <input
          className={cn(
            "w-full glass rounded-xl px-4 py-3 text-stone-100 text-[0.95rem] placeholder:text-stone-600",
            "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 transition",
            prefix && "pl-8",
            suffix && "pr-10",
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 text-stone-500 text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
    </label>
  );
}

export default Field;
