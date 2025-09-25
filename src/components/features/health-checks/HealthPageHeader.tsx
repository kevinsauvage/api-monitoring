import HealthNavigation from "./HealthNavigation";
import RefreshHealthButton from "./RefreshHealthButton";

interface HealthPageHeaderProps {
  title: string;
  description: string;
}

export default function HealthPageHeader({
  title,
  description,
}: HealthPageHeaderProps) {
  return (
    <div className="flex flex-col justify-end w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <HealthNavigation />
      </div>
      <div className="flex justify-end">
        <RefreshHealthButton />
      </div>
    </div>
  );
}
