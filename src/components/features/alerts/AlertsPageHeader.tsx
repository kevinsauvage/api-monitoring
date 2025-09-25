interface AlertsPageHeaderProps {
  title: string;
  description: string;
}

export default function AlertsPageHeader({
  title,
  description,
}: AlertsPageHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        {title}
      </h1>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}
