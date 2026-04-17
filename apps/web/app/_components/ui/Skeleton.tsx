import { cn } from "./cn";

type Props = {
  className?: string;
  width?: number | string;
  height?: number | string;
};

export function Skeleton({ className, width, height }: Props) {
  return (
    <div
      className={cn("ds-skeleton", className)}
      style={{
        width: width ?? "100%",
        height: height ?? 12,
      }}
      aria-hidden
    />
  );
}
