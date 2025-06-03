import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}

const Rating = ({
  rating,
  size = 16,
  className = "",
  showValue = false,
}: RatingProps) => {
  // Generate stars array
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Create 5 stars
  for (let i = 1; i <= 5; i++) {
    let fillPercentage = 0;

    if (i <= fullStars) {
      // Full star
      fillPercentage = 100;
    } else if (i === fullStars + 1 && hasHalfStar) {
      // Half star
      fillPercentage = 50;
    }

    stars.push(
      <div key={i} className="relative inline-block">
        {/* Background star (gray) */}
        <Star size={size} className="text-gray-300" fill="currentColor" />

        {/* Foreground star (filled with color based on rating) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${fillPercentage}%` }}
        >
          <Star size={size} className="text-yellow-400" fill="currentColor" />
        </div>
      </div>,
    );
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {stars}
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
