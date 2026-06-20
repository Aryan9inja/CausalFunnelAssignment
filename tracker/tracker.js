(function() {
  // Configurable base API URL (default: http://localhost:4000)
  const API_BASE_URL = 'http://localhost:4000';

  // UUID v4 generator with fallback if crypto.randomUUID is unavailable
  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Retrieve or initialize session_id in localStorage
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('session_id', sessionId);
  }

  // Helper function to send events to backend (fire-and-forget, log errors)
  function sendEvent(eventData) {
    fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData),
      mode: 'cors'
    })
    .then(response => {
      if (!response.ok) {
        console.error('Tracker received non-OK response from API:', response.status);
      }
    })
    .catch(error => {
      console.error('Failed to send tracking event to API:', error);
    });
  }

  // Track page view event immediately on load
  const pageViewEvent = {
    session_id: sessionId,
    event_type: 'page_view',
    page_url: window.location.href,
    timestamp: new Date().toISOString()
  };
  sendEvent(pageViewEvent);

  // Track click events at the document level
  document.addEventListener('click', function(event) {
    const clickEvent = {
      session_id: sessionId,
      event_type: 'click',
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      x: event.clientX,
      y: event.clientY
    };
    sendEvent(clickEvent);
  });
})();
