export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        {/* Animated Logo/Spinner */}
        <div className="relative mb-8">
          {/* Outer ring */}
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 animate-pulse" />
          {/* Spinning inner ring */}
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
        </div>

        {/* Loading Text */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Loading...
        </h2>
        <p className="text-sm text-gray-500">
          Please wait while we prepare your content
        </p>

        {/* Animated dots */}
        <div className="mt-4 flex justify-center gap-1">
          <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}



