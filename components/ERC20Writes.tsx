import { useState } from "react";
import { getSigner, getContract } from "../lib/hedera";
import ExplorerLinks from "./ExplorerLinks";

function toBigIntOrThrow(s: string) {
  if (!s || !/^\d+$/.test(s)) throw new Error("Amount must be an integer in smallest token units");
  return BigInt(s);
}

export default function ERC20Writes() {
  const [spender, setSpender] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [amount1, setAmount1] = useState(""); // approve
  const [amount2, setAmount2] = useState(""); // transfer
  const [amount3, setAmount3] = useState(""); // transferFrom
  const [txHash, setTxHash] = useState("");
  const [err, setErr] = useState("");

  async function send(fn: () => Promise<any>) {
    setErr(""); setTxHash("");
    try {
      const tx = await fn();
      const rec = await tx.wait?.();
      setTxHash(rec?.hash ?? tx.hash);
    } catch (e:any) { setErr(e?.message ?? String(e)); }
  }

  return (
    <div style={{display:"grid", gap:12}}>
      <h3>Writes</h3>

      <div style={{display:"grid", gap:6}}>
        <strong>approve(spender, amount)</strong>
        <input placeholder="spender (0x...)" value={spender} onChange={e=>setSpender(e.target.value)} />
        <input placeholder="amount (uint256, smallest units)" value={amount1} onChange={e=>setAmount1(e.target.value)} />
        <button onClick={async ()=>{
          const signer = await getSigner();
          const c = getContract(signer);
          await send(() => (c as any).approve(spender, toBigIntOrThrow(amount1)));
        }}>Approve</button>
      </div>

      <div style={{display:"grid", gap:6}}>
        <strong>transfer(to, amount)</strong>
        <input placeholder="to (0x...)" value={to} onChange={e=>setTo(e.target.value)} />
        <input placeholder="amount (uint256, smallest units)" value={amount2} onChange={e=>setAmount2(e.target.value)} />
        <button onClick={async ()=>{
          const signer = await getSigner();
          const c = getContract(signer);
          await send(() => (c as any).transfer(to, toBigIntOrThrow(amount2)));
        }}>Transfer</button>
      </div>

      <div style={{display:"grid", gap:6}}>
        <strong>transferFrom(from, to, amount)</strong>
        <input placeholder="from (0x...)" value={from} onChange={e=>setFrom(e.target.value)} />
        <input placeholder="to (0x...)" value={to} onChange={e=>setTo(e.target.value)} />
        <input placeholder="amount (uint256, smallest units)" value={amount3} onChange={e=>setAmount3(e.target.value)} />
        <button onClick={async ()=>{
          const signer = await getSigner();
          const c = getContract(signer);
          await send(() => (c as any).transferFrom(from, to, toBigIntOrThrow(amount3)));
        }}>Transfer From</button>
      </div>

      <ExplorerLinks tx={txHash} address={import.meta.env.VITE_XITIQUE_ADDRESS} />
      {err && <p style={{color:"crimson"}}>{err}</p>}
    </div>
  );
}