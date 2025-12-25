export function toFixedCoord(n: number) {
  return Number(n.toFixed(6))
}

export function appleMapsDirectionsUrl(dest: { lat: number; lng: number }, label?: string) {
  const lat = toFixedCoord(dest.lat)
  const lng = toFixedCoord(dest.lng)
  const base = `https://maps.apple.com/?daddr=${encodeURIComponent(`${lat},${lng}`)}&dirflg=d`
  return label ? `${base}&q=${encodeURIComponent(label)}` : base
}

export function googleMapsDirectionsUrl(dest: { lat: number; lng: number }, label?: string) {
  const lat = toFixedCoord(dest.lat)
  const lng = toFixedCoord(dest.lng)
  const base = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}&travelmode=driving`
  return label ? `${base}&destination_place_id=${encodeURIComponent(label)}` : base
}



