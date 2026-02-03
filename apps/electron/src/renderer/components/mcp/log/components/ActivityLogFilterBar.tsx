import React from "react";
import { useTranslation } from "react-i18next";
import { IconFilter } from "@tabler/icons-react";
import { cn } from "@/renderer/utils/tailwind-utils";

export interface ActivityLogFilters {
  status: "all" | "success" | "error";
  minDuration: number | null;
}

interface ActivityLogFilterBarProps {
  filters: ActivityLogFilters;
  onFiltersChange: (filters: ActivityLogFilters) => void;
}

const DURATION_OPTIONS = [
  { value: null, label: "All" },
  { value: 100, label: ">100ms" },
  { value: 500, label: ">500ms" },
  { value: 1000, label: ">1s" },
  { value: 5000, label: ">5s" },
];

const ActivityLogFilterBar: React.FC<ActivityLogFilterBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { t } = useTranslation();

  const handleStatusChange = (status: ActivityLogFilters["status"]) => {
    onFiltersChange({ ...filters, status });
  };

  const handleDurationChange = (minDuration: number | null) => {
    onFiltersChange({ ...filters, minDuration });
  };

  return (
    <div className="flex items-center gap-3 mb-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <IconFilter size={14} />
        <span>{t("logs.activity.filter.label", "Filter")}:</span>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1">
        {(["all", "success", "error"] as const).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              filters.status === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted",
            )}
          >
            {t(
              `logs.activity.filter.status.${status}`,
              status.charAt(0).toUpperCase() + status.slice(1),
            )}
          </button>
        ))}
      </div>

      {/* Duration filter */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">
          {t("logs.activity.filter.duration", "Duration")}:
        </span>
        {DURATION_OPTIONS.map((option) => (
          <button
            key={option.value ?? "all"}
            onClick={() => handleDurationChange(option.value)}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              filters.minDuration === option.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted",
            )}
          >
            {option.value === null
              ? t("logs.activity.filter.duration.all", "All")
              : option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActivityLogFilterBar;
