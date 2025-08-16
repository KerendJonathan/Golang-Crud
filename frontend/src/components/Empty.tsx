export default function Empty({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="card p-10 text-center text-gray-500">
      <div className="text-lg font-medium mb-1">{title}</div>
      {subtitle && <div className="text-sm">{subtitle}</div>}
    </div>
  );
}
