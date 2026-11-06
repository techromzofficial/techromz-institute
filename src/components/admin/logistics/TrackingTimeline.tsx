"use client";

import React from "react";
import { TrackingEvent } from "@/types/admin";

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  // Sort events by timestamp descending (latest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="timeline-card">
      <h3>Carrier Tracking</h3>
      {sortedEvents.length === 0 ? (
        <p className="empty-state">No tracking events found.</p>
      ) : (
        <div className="timeline-list">
          {sortedEvents.map((event, index) => (
            <div 
              key={event.id} 
              className={`timeline-event ${event.isException ? "exception" : ""} ${index === 0 ? "latest" : ""}`}
            >
              <div className="event-time">
                {new Date(event.timestamp).toLocaleString([], {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
              <div className="event-desc">{event.description}</div>
              <div className="event-loc">{event.location} • {event.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

