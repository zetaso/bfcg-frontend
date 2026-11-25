export default function SectionTitle({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle?: string;
  light?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <h2 className={`text-3xl md:text-4xl font-semibold ${light ? "text-paper" : "text-ink"}`}>
        {title}
      </h2>
      <span className="block h-1 w-16 bg-primary" />
      {subtitle && (
        <p className={`max-w-2xl text-lg ${light ? "text-paper/80" : "text-steel"}`}>{subtitle}</p>
      )}
    </div>
  );
}
