import { ConnectButton } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';

const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || '3fb79dc13ff017300d8aee80ee0418e4',
});

export function WalletConnect() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      <ConnectButton
        client={client}
        theme="dark"
        connectButton={{
          label: 'Connect Wallet',
          style: {
            background: 'rgba(0, 255, 204, 0.1)',
            border: '1px solid #00ffcc',
            color: '#00ffcc',
            padding: '8px 16px',
            fontSize: '12px',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '2px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          },
        }}
      />
    </div>
  );
}
