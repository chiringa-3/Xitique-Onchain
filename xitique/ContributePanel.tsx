import { useState } from "react";
import { useGroupStore } from "./groupStore";
import { ethers } from "ethers";
import { XCFG } from "./config";
import { contribute } from "./actions";

export default function ContributePanel() {
  const { activeGroup } = useGroupStore();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  if (!activeGroup) {
    return (
      <div style={{
        display: "grid", 
        gap: 8, 
        border: "1px solid #333", 
        borderRadius: 12, 
        padding: 12,
        background: "#f9f9f9"
      }}>
        <h3>Contribute to Group</h3>
        <p style={{ color: "#666", fontStyle: "italic" }}>
          Select or create a group first to contribute.
        </p>
      </div>
    );
  }

  const dec = XCFG.tokenDecimals;
  
  // Convert raw contribution amount to human readable
  const humanContribution = activeGroup.contributionRaw 
    ? ethers.formatUnits(activeGroup.contributionRaw, dec)
    : "0";

  function addLog(msg: string) {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  }

  async function handleContribute() {
    if (!amount || parseFloat(amount) <= 0) {
      addLog("❌ Please enter a valid contribution amount");
      return;
    }

    if (!activeGroup) {
      addLog("❌ No active group selected");
      return;
    }

    setIsLoading(true);
    try {
      addLog(`🔄 Contributing ${amount} to group ${activeGroup.id}...`);
      const result = await contribute(activeGroup.id, amount);
      
      if (result.simulated) {
        addLog(`✅ Contribution simulated: ${JSON.stringify(result)}`);
      } else if (result.txHash) {
        addLog(`✅ Contribution successful! TX: ${result.txHash}`);
      } else {
        addLog(`✅ Contribution completed: ${JSON.stringify(result)}`);
      }
      
      setAmount(""); // Clear input on success
    } catch (err: any) {
      addLog(`❌ Contribution failed: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{
      display: "grid", 
      gap: 12, 
      border: "1px solid #333", 
      borderRadius: 12, 
      padding: 16,
      background: "#fff"
    }}>
      <h3 style={{ margin: 0, color: "#2d3748" }}>Contribute — {activeGroup.name}</h3>
      
      {/* Group Info */}
      <div style={{ 
        background: "#f7fafc", 
        padding: 12, 
        borderRadius: 8, 
        fontSize: "14px",
        border: "1px solid #e2e8f0"
      }}>
        <div><strong>Group ID:</strong> {activeGroup.id}</div>
        <div><strong>Expected Contribution:</strong> {humanContribution} USDT</div>
        {activeGroup.frequencyDays && (
          <div><strong>Frequency:</strong> {activeGroup.frequencyDays} days</div>
        )}
        {activeGroup.maxParticipants && (
          <div><strong>Max Participants:</strong> {activeGroup.maxParticipants}</div>
        )}
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
          Raw amount: {activeGroup.contributionRaw}
        </div>
      </div>

      {/* Contribution Input */}
      <div style={{ display: "grid", gap: 8 }}>
        <label htmlFor="contribute-amount" style={{ fontWeight: "500" }}>
          Contribution Amount (USDT):
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            id="contribute-amount"
            type="number"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px"
            }}
            disabled={isLoading}
          />
          <button
            onClick={() => setAmount(humanContribution)}
            style={{
              padding: "8px 12px",
              border: "1px solid #3182ce",
              borderRadius: "6px",
              background: "#bee3f8",
              cursor: "pointer",
              fontSize: "12px"
            }}
            disabled={isLoading}
          >
            Use Expected
          </button>
        </div>
      </div>

      {/* Contribute Button */}
      <button
        onClick={handleContribute}
        disabled={isLoading || !amount}
        style={{
          padding: "12px 16px",
          border: "1px solid #38a169",
          borderRadius: "8px",
          background: isLoading ? "#a0aec0" : "#48bb78",
          color: "white",
          cursor: isLoading ? "not-allowed" : "pointer",
          fontWeight: "600",
          fontSize: "14px"
        }}
      >
        {isLoading ? "Contributing..." : `Contribute ${amount || "Amount"} USDT`}
      </button>

      {/* Activity Log */}
      {log.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#4a5568" }}>
            Recent Activity:
          </h4>
          <div style={{
            maxHeight: "120px",
            overflow: "auto",
            fontSize: "12px",
            fontFamily: "monospace",
            background: "#1a202c",
            color: "#e2e8f0",
            padding: "8px",
            borderRadius: "4px"
          }}>
            {log.map((entry, i) => (
              <div key={i} style={{ marginBottom: "2px" }}>
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}