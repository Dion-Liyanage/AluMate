interface AnalyticsCardProps {
  title: string;
  value: number | string;
  description?: string;
}

export default function AnalyticsCard({ title, value, description }: AnalyticsCardProps) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{value}</p>
      {description && <p>{description}</p>}
    </div>
  );
}
