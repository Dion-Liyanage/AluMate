interface OrderCardProps {
  title: string;
  status: string;
  date: string;
}

export default function OrderCard({ title, status, date }: OrderCardProps) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{status}</p>
      <p>{date}</p>
    </div>
  );
}
