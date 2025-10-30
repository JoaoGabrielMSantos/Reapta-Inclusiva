export function DashboardCard({ title, value, change, icon: Icon, iconColor = "text-primary" }) {
  return (
    <div className="bg-card rounded-lg shadow p-4">
      <div className="flex flex-row items-center justify-between pb-2">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {change && <p className="text-xs text-green-600 mt-1">↑ {change}</p>}
      </div>
    </div>
  );
}
