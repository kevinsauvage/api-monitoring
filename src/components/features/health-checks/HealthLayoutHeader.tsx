import { Card, CardContent } from "@/components/ui/card";

interface HealthLayoutHeaderProps {
  title: string;
  description: string;
}

export default function HealthLayoutHeader({
  title,
  description,
}: HealthLayoutHeaderProps) {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
