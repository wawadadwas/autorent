import React, { useEffect } from 'react';

/**
 * InspectorGuard
 * Deters casual inspection, unauthorized copying of design/logic.
 * Note: No client-side protection is absolute, but this deters 99% of people.
 */
const InspectorGuard = ({ children }) => {
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      console.warn('%c🛡️ SECURITY ALERT', 'color: red; font-size: 24px; font-weight: bold;');
      console.warn('Right-click is disabled for security and IP protection.');
    };

    // 2. Disable Common Inspection Shortcuts
    const handleKeyDown = (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (Inspector)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 105)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 74 || e.keyCode === 106)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+C (Element Selector)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 67 || e.keyCode === 99)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 117)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && (e.keyCode === 83 || e.keyCode === 115)) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Debugger Trap (Pauses execution if DevTools is open)
    // This is optional and can be slightly disruptive to UX if triggered,
    // but highly effective against casual inspection.
    const debuggerInterval = setInterval(() => {
      // The classic debugger trap. 
      // If DevTools is open, the debugger statement will halt execution.
      (function() {
        // eslint-disable-next-line no-debugger
        debugger;
      }());
    }, 1000);

    // 4. Console Clearing
    const consoleInterval = setInterval(() => {
      console.clear();
      console.log('%c🛡️ AutoRent Shield Active', 'color: #2563eb; font-size: 20px; font-weight: bold;');
      console.log('Unauthorized inspection is restricted. Your IP and access patterns are being monitored for security audits.');
    }, 2000);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(debuggerInterval);
      clearInterval(consoleInterval);
    };
  }, []);

  return <>{children}</>;
};

export default InspectorGuard;
