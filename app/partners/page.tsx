export default function PartnersPage() {
  const partners = [
    { name: 'LORIOT UAE Server' },
    { name: 'Mapbox', url: 'https://www.mapbox.com/maps' },
    { name: 'Rak Wireless' },
    { name: 'MokoSmart' },
  ]

  return (
    <div className="pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Partners & Pilots
          </h1>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
            >
              {partner.url ? (
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                >
                  {partner.name}
                </a>
              ) : (
                <div className="text-lg font-semibold text-gray-900">
                  {partner.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

