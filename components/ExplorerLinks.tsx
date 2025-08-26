interface Props { tx?: string; address?: string; }
export default function ExplorerLinks({ tx, address }: Props) {
  return (
    <div style={{display:"flex", gap:12}}>
      {tx && <a href={`https://hashscan.io/testnet/tx/${tx}`} target="_blank">View Tx</a>}
      {address && <a href={`https://hashscan.io/testnet/address/${address}`} target="_blank">Contract</a>}
    </div>
  );
}