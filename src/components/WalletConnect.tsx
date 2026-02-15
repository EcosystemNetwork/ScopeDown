import { createThirdwebClient } from 'thirdweb';
import { ConnectButton } from 'thirdweb/react';

// Create Thirdweb client with client ID from env
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

if (!clientId) {
  console.warn(
    'VITE_THIRDWEB_CLIENT_ID is not set. Wallet connection features may not work properly.\n' +
    'To fix this, create a .env file in the root directory and add:\n' +
    'VITE_THIRDWEB_CLIENT_ID=your_client_id_here\n' +
    'Get your client ID from https://thirdweb.com/dashboard'
  );
}

const client = createThirdwebClient({
  clientId: clientId || 'demo-client-id',
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
          label: 'CONNECT WALLET',
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
            borderRadius: '0px',
          },
        }}
        detailsButton={{
          style: {
            background: 'rgba(0, 255, 204, 0.2)',
            border: '1px solid #00ffcc',
            color: '#00ffcc',
            padding: '8px 16px',
            fontSize: '12px',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '2px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderRadius: '0px',
          },
        }}
        connectModal={{
          size: 'wide',
          title: 'CONNECT TO SCOPEDOWN',
          titleIcon: '🔗',
          showThirdwebBranding: false,
        }}
      />
    </div>
  );
}
