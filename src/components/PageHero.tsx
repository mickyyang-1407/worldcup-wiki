const HEX = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`;

interface Props {
  title: string;
  subtitle?: string;
  gradient: string;
  tag?: string;
  icon?: string;
}

export default function PageHero({ title, subtitle, gradient, tag, icon }: Props) {
  return (
    <div
      className="-mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-8 relative overflow-hidden"
      style={{ minHeight: 128 }}
    >
      {/* Gradient bg */}
      <div className="absolute inset-0" style={{ background: gradient }} />
      {/* Hex pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: HEX, backgroundSize: "44px 44px", opacity: .055,
      }} />
      {/* Vignette edges */}
      <div className="absolute inset-0" style={{
        background: "rgba(0,0,0,.25)",
      }} />
      {/* Right decorative icon */}
      {icon && (
        <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          style={{ fontSize: 80, opacity: .09, lineHeight: 1 }}>
          {icon}
        </div>
      )}
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "rgba(255,255,255,.35)" }} />
      {/* Content */}
      <div className="relative z-10 px-6 md:px-8 flex flex-col justify-center" style={{ minHeight: 128 }}>
        {tag && (
          <div className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "rgba(255,255,255,.45)" }}>
            {tag}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,.55)" }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
