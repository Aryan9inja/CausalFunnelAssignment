export interface Session {
  session_id: string;
  eventCount: number;
  lastActive: string;
}

export interface TrackedEvent {
  _id: string;
  session_id: string;
  event_type: 'page_view' | 'click';
  page_url: string;
  timestamp: string;
  x?: number;
  y?: number;
}

export interface ClickEvent {
  x: number;
  y: number;
}
