interface EventCardProps {
  title: string;
  date: string;
  location: string;
}

export default function EventCard({ title, date, location }: EventCardProps) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{date}</p>
      <p>{location}</p>
    </div>
  );
}
