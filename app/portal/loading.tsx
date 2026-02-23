export default function PortalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
        </div>
        <p className="text-sm text-gray-500">Loading portal...</p>
      </div>
    </div>
  )
}
