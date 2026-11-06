"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import type { LogisticsTrackingMap, LogisticsTrackingPoint } from "@/lib/api/logistics";

const valid = (point: LogisticsTrackingPoint | null): point is LogisticsTrackingPoint => Boolean(point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && point.latitude >= -90 && point.latitude <= 90 && point.longitude >= -180 && point.longitude <= 180);
const position = (point: LogisticsTrackingPoint): [number, number] => [point.latitude, point.longitude];

function FitRoute({ points }: { points: LogisticsTrackingPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) map.setView(position(points[0]), 13);
    if (points.length > 1) map.fitBounds(new LatLngBounds(points.map(position)), { padding: [28, 28], maxZoom: 14 });
  }, [map, points]);
  return null;
}

function Marker({ point, color, title, carrier, trackingNumber }: { point: LogisticsTrackingPoint; color: string; title: string; carrier: string | null; trackingNumber: string | null }) {
  return <CircleMarker center={position(point)} radius={8} pathOptions={{ color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 }}><Popup><div className="space-y-1 text-sm"><strong>{title}</strong>{point.status ? <div>{point.status.replaceAll("_", " ")}</div> : null}{point.label ? <div>{point.label}</div> : null}{point.city || point.country_code ? <div>{[point.city, point.country_code].filter(Boolean).join(", ")}</div> : null}{point.occurred_at ? <div>Event: <time>{new Date(point.occurred_at).toLocaleString()}</time></div> : null}{point.estimated_arrival_at ? <div>Planned arrival: <time>{new Date(point.estimated_arrival_at).toLocaleString()}</time></div> : null}{point.estimated_departure_at ? <div>Planned departure: <time>{new Date(point.estimated_departure_at).toLocaleString()}</time></div> : null}{point.note ? <div>{point.note}</div> : null}{carrier ? <div>{carrier}</div> : null}{trackingNumber ? <div>{trackingNumber}</div> : null}</div></Popup></CircleMarker>;
}

export default function ShipmentTrackingMap({ tracking, carrier, trackingNumber }: { tracking: LogisticsTrackingMap; carrier: string | null; trackingNumber: string | null }) {
  const [tileError, setTileError] = useState(false);
  const origin = valid(tracking.origin) ? tracking.origin : null;
  const destination = valid(tracking.destination) ? tracking.destination : null;
  const latest = valid(tracking.latest_location) ? tracking.latest_location : null;
  const planned = (tracking.planned_transit_points ?? []).filter(valid);
  const events = tracking.events.filter(valid);
  const route = useMemo(() => {
    const candidates = [origin, ...planned, ...events, destination].filter(valid);
    return candidates.filter((point, index) => index === 0 || point.latitude !== candidates[index - 1].latitude || point.longitude !== candidates[index - 1].longitude);
  }, [destination, events, origin, planned]);

  if (!route.length) return <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold text-slate-900">Shipment Tracking Map</h2><div className="mt-4 grid min-h-[320px] place-items-center rounded-lg bg-slate-50 px-6 text-center text-sm text-slate-500">Tracking location is not available for this shipment.</div></section>;

  return <section className="rounded-xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Shipment Tracking Map</h2><p className="mt-1 text-sm text-slate-500">Planned route and authoritative persisted tracking locations. This is not continuous GPS.</p>{tracking.estimated_arrival ? <p className="mt-1 text-xs text-slate-500">Planned country arrival: {new Date(tracking.estimated_arrival).toLocaleString()}</p> : null}{tracking.estimated_delivery ? <p className="text-xs text-slate-500">Planned final delivery: {new Date(tracking.estimated_delivery).toLocaleString()}</p> : null}</div>{latest ? <div className="text-right text-xs text-slate-500"><div className="font-semibold text-slate-700">Latest Tracking Location</div><div>{latest.label ?? `${latest.latitude.toFixed(5)}, ${latest.longitude.toFixed(5)}`}</div></div> : null}</div><div className="mt-4 h-[400px] min-h-[320px] w-full overflow-hidden rounded-lg border border-slate-200" aria-label="Shipment route map">{tileError ? <div className="grid h-full place-items-center bg-slate-50 px-6 text-center text-sm text-slate-500">Map tiles could not be loaded. Shipment location details remain available below.</div> : <MapContainer center={position(route[0])} zoom={11} scrollWheelZoom className="h-full w-full"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: () => setTileError(true) }} />{route.length > 1 ? <Polyline positions={route.map(position)} pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.75, dashArray: "8 6" }} /> : null}{origin ? <Marker point={origin} color="#166534" title="Origin" carrier={carrier} trackingNumber={trackingNumber} /> : null}{planned.map((point) => <Marker key={`planned-${point.id ?? point.sequence}`} point={point} color="#7c3aed" title={`Planned Transit ${point.sequence ?? ""}`} carrier={carrier} trackingNumber={trackingNumber} />)}{events.map((event) => <Marker key={event.id ?? `${event.latitude}-${event.longitude}-${event.occurred_at}`} point={event} color={latest?.id === event.id ? "#f59e0b" : "#2563eb"} title={latest?.id === event.id ? "Latest Tracking Location" : "Tracking Event"} carrier={carrier} trackingNumber={trackingNumber} />)}{destination ? <Marker point={destination} color="#be123c" title="Destination" carrier={carrier} trackingNumber={trackingNumber} /> : null}<FitRoute points={route} /></MapContainer>}</div><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600"><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-green-800" />Origin</span><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-violet-600" />Planned transit</span><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />Tracking event</span><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />Latest location</span><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-rose-700" />Destination</span><span className="text-slate-400">Dashed line connects known points; it is not a calculated road, air, or sea route.</span></div></section>;
}
