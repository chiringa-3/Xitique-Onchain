import ConnectWallet from "../components/ConnectWallet";
import UnitConverter from "../components/UnitConverter";
import ERC20Views from "../components/ERC20Views";
import ERC20Writes from "../components/ERC20Writes";

export default function ERC20Demo() {
  return (
    <div style={{padding:16, display:"grid", gap:16, maxWidth:820}}>
      <h1>ERC-20 DApp — Hedera Testnet</h1>
      <ConnectWallet />
      <UnitConverter />
      <ERC20Views />
      <ERC20Writes />
    </div>
  );
}