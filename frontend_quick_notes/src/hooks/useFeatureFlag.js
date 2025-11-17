import { useMemo } from 'react';
import { getEnvConfig } from '../config';

// PUBLIC_INTERFACE
export function useFeatureFlag(flagName, defaultValue = false) {
  /** Read-only feature flag hook from REACT_APP_FEATURE_FLAGS JSON */
  const { featureFlags } = useMemo(() => getEnvConfig(), []);
  return (flagName in (featureFlags || {})) ? !!featureFlags[flagName] : defaultValue;
}
