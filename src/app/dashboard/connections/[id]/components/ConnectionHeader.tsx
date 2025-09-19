import ConnectionActions from "../../components/ConnectionActions";

interface ConnectionHeaderProps {
  connection: {
    id: string;
    name: string;
    provider: string;
    isActive: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
}

export default function ConnectionHeader({
  connection,
}: ConnectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{connection.name}</h1>
        <p className="text-muted-foreground">
          Monitor and manage your {connection.provider} API connection
        </p>
      </div>
      <ConnectionActions connection={connection} />
    </div>
  );
}
