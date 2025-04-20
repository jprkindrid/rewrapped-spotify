// Reads ?error=... from the URL and displays a message if present
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const msgEl  = document.getElementById('message');
  
    if (params.has('error')) {
      const code = params.get('error');
      let text;
  
      switch (code) {
        case 'auth_failed':
          text = 'Authentication failed. Please try again.';
          break;
        case 'session_expired':
          text = 'Session expired. Please log in again.';
          break;
        default:
          text = 'An unexpected error occurred.';
      }
  
      msgEl.textContent = text;
      // strip the query string so it doesn’t show again on reload
      history.replaceState(null, '', window.location.pathname);
    }
  });
  