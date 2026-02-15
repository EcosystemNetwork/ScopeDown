import { useState } from 'react';

export function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Check if wallet is available
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        }) as string[];
        
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          console.log('Wallet connected:', address);
        }
      } else {
        console.warn('No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.');
        alert('Please install MetaMask or another Web3 wallet to connect.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    console.log('Wallet disconnected');
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      {walletAddress ? (
        <button
          onClick={handleDisconnect}
          style={{
            background: 'rgba(0, 255, 204, 0.2)',
            border: '1px solid #00ffcc',
            color: '#00ffcc',
            padding: '8px 16px',
            fontSize: '12px',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '2px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          style={{
            background: 'rgba(0, 255, 204, 0.1)',
            border: '1px solid #00ffcc',
            color: '#00ffcc',
            padding: '8px 16px',
            fontSize: '12px',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '2px',
            cursor: isConnecting ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            opacity: isConnecting ? 0.6 : 1,
          }}
        >
          {isConnecting ? 'CONNECTING...' : '🔗 CONNECT WALLET'}
        </button>
      )}
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
