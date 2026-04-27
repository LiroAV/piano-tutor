import type { InputStatus } from "@/types";

interface Props {
  status: InputStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: Props) {
  const config = {
    disconnected: {
      dot: "bg-zinc-500",
      text: "text-zinc-400",
      label: "Disconnected",
    },
    connecting: {
      dot: "bg-yellow-400 animate-pulse",
      text: "text-yellow-400",
      label: "Connecting…",
    },
    connected: {
      dot: "bg-emerald-400",
      text: "text-emerald-400",
      label:
        status.type === "connected" && status.deviceName
          ? status.deviceName
          : "Connected",
    },
    error: {
      dot: "bg-red-500",
      text: "text-red-400",
      label: status.type === "error" ? status.message : "Error",
    },
  }[status.type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.text} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
