let logoutTimer;
let warningTimer;

export function initAutoLogout(logout, delay = 600 * 1000, warningBefore = 3 * 1000) {
  clearTimeout(logoutTimer);
  clearTimeout(warningTimer);

  const startTimers = () => {
    clearTimeout(logoutTimer);
    clearTimeout(warningTimer);

    // Cảnh báo trước khi logout
    warningTimer = setTimeout(() => {
      const event = new CustomEvent('show-logout-warning');
      window.dispatchEvent(event);
    }, delay - warningBefore);

    // Logout thực sự
    logoutTimer = setTimeout(() => {
      localStorage.removeItem('accessToken');
      logout();
      window.location.href = '/login';

    }, delay);
  };

  const resetTimer = () => {
    startTimers();
  };

  const events = ['click', 'mousemove', 'keydown', 'scroll'];
  for (const event of events) {
    clearTimeout(warningTimer);

    const startTimers = () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);

      // Cảnh báo trước khi logout
      warningTimer = setTimeout(() => {
        const event = new CustomEvent('show-logout-warning');
        window.dispatchEvent(event);
      }, delay - warningBefore);

      // Logout thực sự
      logoutTimer = setTimeout(() => {
        localStorage.removeItem('accessToken');
        logout();
        window.location.href = '/login';

      }, delay);
    };

    const resetTimer = () => {
      startTimers();
    };

    const events = ['click', 'mousemove', 'keydown', 'scroll'];
    for (const event of events) {
      window.addEventListener(event, resetTimer);
    }

    startTimers();
  }
}

export function stopAutoLogout() {
  clearTimeout(logoutTimer);
  clearTimeout(warningTimer);

  const events = ['click', 'mousemove', 'keydown', 'scroll'];
  for (const event of events) {
    window.removeEventListener(event, stopAutoLogout);
  }
}
