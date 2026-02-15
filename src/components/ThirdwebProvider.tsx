import React from 'react';

interface ThirdwebAppProviderProps {
  children: React.ReactNode;
}

// Thirdweb provider is now set up in the main App component
// This component is just a pass-through for now
export function ThirdwebAppProvider({ children }: ThirdwebAppProviderProps) {
  return <>{children}</>;
}
