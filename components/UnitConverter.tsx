import { useState } from "react";
import { ethers } from "ethers";

export default function UnitConverter() {
  const [decimals, setDecimals] = useState<number>(18);
  const [human, setHuman] = useState("");
  const [raw, setRaw] = useState("");

  function h2r() {
    try { setRaw(ethers.parseUnits(human || "0", decimals).toString()); } catch { setRaw("invalid"); }
  }
  function r2h() {
    try { setHuman(ethers.formatUnits(raw || "0", decimals)); } catch { setHuman("invalid"); }
  }

  return (
    <div style={{display:"grid", gap:8, padding:12, border:"1px solid #333", borderRadius:8}}>
      <strong>Unit Converter</strong>
      <label>Token Decimals</label>
      <input type="number" min={0} max={36} value={decimals} onChange={e=>setDecimals(Number(e.target.value))} />
      <div style={{display:"grid", gap:6}}>
        <input placeholder="Human amount (e.g. 1.5)" value={human} onChange={e=>setHuman(e.target.value)} />
        <button onClick={h2r}>Human → Raw</button>
        <code>{raw}</code>
      </div>
      <div style={{display:"grid", gap:6}}>
        <input placeholder="Raw amount (uint256)" value={raw} onChange={e=>setRaw(e.target.value)} />
        <button onClick={r2h}>Raw → Human</button>
        <code>{human}</code>
      </div>
    </div>
  );
}