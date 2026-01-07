import { useState, useEffect, useCallback } from 'react';

const TOS_ACCEPTANCE_KEY = 'resusbuddy-tos-accepted';
const TOS_VERSION = '1.0'; // Increment this when TOS changes significantly

interface TosAcceptanceState {
  hasAccepted: boolean;
  isLoading: boolean;
}

export function useTosAcceptance() {
  const [state, setState] = useState<TosAcceptanceState>({
    hasAccepted: true, // Default to true to prevent flash
    isLoading: true,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOS_ACCEPTANCE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if the accepted version matches current version
        const hasAccepted = parsed.version === TOS_VERSION && parsed.accepted === true;
        setState({ hasAccepted, isLoading: false });
      } else {
        setState({ hasAccepted: false, isLoading: false });
      }
    } catch {
      setState({ hasAccepted: false, isLoading: false });
    }
  }, []);

  const acceptTos = useCallback(() => {
    try {
      localStorage.setItem(
        TOS_ACCEPTANCE_KEY,
        JSON.stringify({
          accepted: true,
          version: TOS_VERSION,
          timestamp: new Date().toISOString(),
        })
      );
      setState({ hasAccepted: true, isLoading: false });
    } catch {
      // If localStorage fails, still allow usage but it won't persist
      setState({ hasAccepted: true, isLoading: false });
    }
  }, []);

  return {
    hasAccepted: state.hasAccepted,
    isLoading: state.isLoading,
    acceptTos,
  };
}
