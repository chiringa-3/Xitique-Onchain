import { useState } from "react";
import { getContract } from "../lib/hedera";
import ExplorerLinks from "./ExplorerLinks";

export default function ERC20Views() {
  const [owner, setOwner] = useState("");
  const [spender, setSpender] = useState("");
  const [account, setAccount] = useState("");
  const [allowance, setAllowance] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [supply, setSupply] = useState<string>("");

  async function readAllowance() {
    try {
      const c = getContract();
      const res = await (c as any).allowance(owner, spender);
      setAllowance(res.toString());
    } catch (e:any) { setAllowance(e?.message ?? String(e)); }
  }
  async function readBalance() {
    try {
      const c = getContract();
      const res = await (c as any).balanceOf(account);
      setBalance(res.toString());
    } catch (e:any) { setBalance(e?.message ?? String(e)); }
  }
  async function readSupply() {
    try {
      const c = getContract();
      const res = await (c as any).totalSupply();
      setSupply(res.toString());
    } catch (e:any) { setSupply(e?.message ?? String(e)); }
  }

  return (
    <div style={{display:"grid", gap:12}}>
      <h3>Reads</h3>

      <div style={{display:"grid", gap:6}}>
        <strong>allowance(owner, spender)</strong>
        <input placeholder="owner (0x...)" value={owner} onChange={e=>setOwner(e.target.value)} />
        <input placeholder="spender (0x...)" value={spender} onChange={e=>setSpender(e.target.value)} />
        <button onClick={readAllowance}>Read Allowance</button>
        <code>{allowance}</code>
      </div>

      <div style={{display:"grid", gap:6}}>
        <strong>balanceOf(account)</strong>
        <input placeholder="account (0x...)" value={account} onChange={e=>setAccount(e.target.value)} />
        <button onClick={readBalance}>Read Balance</button>
        <code>{balance}</code>
      </div>

      <div style={{display:"grid", gap:6}}>
        <strong>totalSupply()</strong>
        <button onClick={readSupply}>Read Total Supply</button>
        <code>{supply}</code>
      </div>

      <ExplorerLinks address={import.meta.env.VITE_XITIQUE_ADDRESS} />
    </div>
  );
}