/**
 * Ratings are stored 0–5. Sites in this genre display a 0–10 score next to the
 * stars, so we show both from the same value.
 */
export function StarRating({
  rating,
  size = 'sm',
  showScore = true,
}: {
  rating: number;
  size?: 'xs' | 'sm';
  showScore?: boolean;
}) {
  const filled = Math.round(rating);
  const dimension = size === 'xs' ? 'text-[9px]' : 'text-[11px]';

  return (
    <span className="flex items-center gap-1">
      <span className={`${dimension} leading-none tracking-tight`} aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={i < filled ? 'text-star' : 'text-border'}>
            ★
          </span>
        ))}
      </span>
      {showScore ? (
        <span className={`${dimension} font-semibold text-muted`}>
          {(rating * 2).toFixed(1)}
        </span>
      ) : null}
      <span className="sr-only">{rating.toFixed(1)} out of 5</span>
    </span>
  );
}
