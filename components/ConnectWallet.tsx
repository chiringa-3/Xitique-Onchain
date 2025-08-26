import { useEffect, useState } from "react";
import { getSigner } from "../lib/hedera";

export default function ConnectWallet() {
  const [account, setAccount] = useState("");

  async function connect() {
    try {
      const signer = await getSigner();
      setAccount(await signer.getAddress());
    } catch (e:any) {
      alert(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    (window as any)?.ethereum?.on?.("accountsChanged", (accs: string[]) => {
      setAccount(accs?.[0] ?? "");
    });
  }, []);

  return (
    <div style={{display:"flex", gap:8, alignItems:"center"}}>
      <button onClick={connect}>{account ? "Connected" : "Connect Wallet"}</button>
      {account && <code style={{fontSize:12}}>{account}</code>}
    </div>
  );
}