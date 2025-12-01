import { cn } from "@/lib/utils";

export default function Spinner({
  size = "xl",
  color = "#800080",
  className = "",
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const barSizes = {
    sm: { width: 1.5, height: 4, radius: 8 },
    md: { width: 2, height: 5, radius: 10 },
    lg: { width: 2.5, height: 6, radius: 12 },
    xl: { width: 3, height: 8, radius: 16 },
  };

  const bars = Array.from({ length: 12 }, (_, i) => i);
  const { width, height, radius } = barSizes[size];

  return (
    <div
      className={cn("relative", sizeClasses[size], className)}
      role="status"
      aria-label="Loading"
    >
      {bars.map((i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 origin-center"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            marginLeft: `-${width / 2}px`,
            marginTop: `-${radius}px`,
            transform: `rotate(${i * 30}deg) translateY(-${radius - height / 2}px)`,
            animation: `spinner 1s linear infinite`,
            animationDelay: `${-1 + i * (1 / 12)}s`,
            backgroundColor: color || "currentColor",
            borderRadius: `${width}px`,
            opacity: 0,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes spinner {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0.15;
          }
        }
      `}</style>
    </div>
  );
}
