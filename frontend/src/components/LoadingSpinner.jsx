/**
 * Loading Spinner Component
 * Provides consistent loading states across the application
 */

export default function LoadingSpinner({ size = 'md', fullScreen = false, message = 'Loading...' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizes[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      ></div>
      {message && (
        <p className="mt-3 text-sm text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Inline Loading Spinner (small, for buttons, etc.)
 */
export function InlineSpinner({ className = '' }) {
  return (
    <div
      className={`inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    ></div>
  );
}

/**
 * Table Loading Skeleton
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-4 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="h-4 bg-gray-300 rounded flex-1"></div>
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 mb-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 bg-gray-200 rounded flex-1"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Card Loading Skeleton
 */
export function CardSkeleton({ count = 1 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-6 animate-pulse"
        >
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
}
