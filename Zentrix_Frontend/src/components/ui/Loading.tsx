interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  progress?: number; // 0-100
  showProgressBar?: boolean;
  progressText?: string;
}

function Loading({
  size = 'md',
  text = 'Loading...',
  progress,
  showProgressBar = false,
  progressText
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const progressBarWidth = progress !== undefined ? `${progress}%` : '0%';

  return (
    <div className="flex flex-col items-center justify-center p-4 loading-container">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin loading-spinner`}></div>
        {showProgressBar && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden loading-progress-bar">
              <div
                className="h-full bg-blue-500 transition-all duration-300 ease-out loading-progress-fill"
                style={{ width: progressBarWidth }}
              ></div>
            </div>
          </div>
        )}
      </div>
      {text && <p className="mt-3 text-gray-600 loading-text transition-opacity duration-200">{text}</p>}
      {progressText && (
        <p className="mt-1 text-sm text-blue-400 loading-progress-text transition-all duration-200">
          {progressText}
        </p>
      )}
      {progress !== undefined && (
        <p className="mt-1 text-xs text-gray-500 loading-percentage">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
}

export default Loading;