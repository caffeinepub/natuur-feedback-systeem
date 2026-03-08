import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="star-icon focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label={`${star} ster${star > 1 ? "ren" : ""}`}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= value
                ? "fill-[oklch(0.78_0.14_85)] text-[oklch(0.70_0.12_55)]"
                : "text-[oklch(0.75_0.04_75)] hover:text-[oklch(0.78_0.14_85)]"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
