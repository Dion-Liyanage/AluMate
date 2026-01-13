interface ProfileCardProps {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ProfileCard({ firstName, lastName, email }: ProfileCardProps) {
  return (
    <div>
      <h3>{firstName} {lastName}</h3>
      <p>{email}</p>
    </div>
  );
}
