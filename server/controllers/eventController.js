import Event from '../models/Event.js';

/**
 * Handle new tracking event ingestion (validation, saving to Mongo).
 */
export async function createEvent(req, res) {
  try {
    const { session_id, event_type, page_url, timestamp, x, y } = req.body;

    // Basic Validation
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid session_id' });
    }
    if (!event_type || !['page_view', 'click'].includes(event_type)) {
      return res.status(400).json({ error: 'event_type must be "page_view" or "click"' });
    }
    if (!page_url || typeof page_url !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid page_url' });
    }
    if (!timestamp || isNaN(Date.parse(timestamp))) {
      return res.status(400).json({ error: 'Missing or invalid timestamp (must be ISO Date string)' });
    }

    if (event_type === 'click') {
      if (typeof x !== 'number' || typeof y !== 'number') {
        return res.status(400).json({ error: 'Coordinates x and y must be numbers for click events' });
      }
    }

    const event = new Event({
      session_id,
      event_type,
      page_url,
      timestamp: new Date(timestamp),
      x: event_type === 'click' ? x : undefined,
      y: event_type === 'click' ? y : undefined
    });

    await event.save();
    return res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('Error saving event:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Fetch distinct sessions, count, and last active timestamp.
 */
export async function getSessions(req, res) {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: '$session_id',
          eventCount: { $sum: 1 },
          lastActive: { $max: '$timestamp' }
        }
      },
      {
        $project: {
          session_id: '$_id',
          _id: 0,
          eventCount: 1,
          lastActive: 1
        }
      },
      {
        $sort: { lastActive: -1 }
      }
    ]);

    return res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Retrieve chronological list of events for a single session.
 */
export async function getSessionEvents(req, res) {
  try {
    const { session_id } = req.params;
    const events = await Event.find({ session_id }).sort({ timestamp: 1 });
    
    return res.json(events);
  } catch (error) {
    console.error('Error fetching events for session:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Fetch only click coordinates (x, y) matching a specific page URL.
 */
export async function getHeatmap(req, res) {
  try {
    const { page_url } = req.query;
    if (!page_url) {
      return res.status(400).json({ error: 'Query parameter "page_url" is required' });
    }

    const clicks = await Event.find(
      { event_type: 'click', page_url },
      { x: 1, y: 1, _id: 0 }
    );

    return res.json(clicks);
  } catch (error) {
    console.error('Error fetching heatmap clicks:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
