export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Loading...
        </h2>
        <p className="text-sm text-gray-500">
          Please wait while we prepare your content
        </p>

        <div className="mt-4 flex justify-center gap-1">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

