import React, { useState, useEffect } from "react";
import { UserService } from "../UserService";

const SCHEMAS = [
  { key: "girls", label: "Girls", color: "#ff36ba" },
  { key: "photos", label: "Photos", color: "#7e47f7" }
];

const COLLECTION = "nightclubnft";

// Este modal sirve tanto para stake como para unstake
function NFTModal({ open, onClose, schemaTabs, action, onAction, loadingAction }) {
  const [activeTab, setActiveTab] = useState(schemaTabs[0].key);
  const [nfts, setNfts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const wallet = UserService.isLogged() ? UserService.getName() : null;

  useEffect(() => {
    if (open && wallet) {
      setMensaje("Cargando NFTs...");
      fetch(
        `https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=${COLLECTION}&owner=${wallet}&schema_name=${activeTab}&limit=100`
      )
        .then(res => res.json())
        .then(json => {
          setNfts(Array.isArray(json.data) ? json.data : []);
          setMensaje("");
        })
        .catch(() => {
          setMensaje("Error al cargar tus NFTs");
          setNfts([]);
        });
    }
  }, [open, wallet, activeTab]);

  // Selección visual
  const toggleSelect = (assetId) => {
    setSelected((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  // Proporción 9:16 y redondeado suave
  const videoStyle = {
    width: "100%",
    aspectRatio: "9/16",
    borderRadius: "28px",
    objectFit: "cover",
    boxShadow: "0 8px 40px #ff36ba26",
    border: 0,
    background: "#19191d"
  };

  return open ? (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(19,15,24,0.94)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#221831", borderRadius: 32, minWidth: 420, minHeight: 360,
        boxShadow: "0 10px 40px #000b", padding: 42, position: "relative", maxWidth: 880, width: "97vw"
      }}>
        <button onClick={() => { onClose(); setSelected([]); setMensaje(""); }}
          style={{
            position: "absolute", top: 20, right: 24, fontSize: 34, color: "#fff", background: "none", border: "none",
            cursor: "pointer", fontWeight: "bold", lineHeight: "1"
          }} disabled={loadingAction}>&times;</button>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2.5px solid #3f275a", marginBottom: 18 }}>
          {schemaTabs.map(tab =>
            <button
              key={tab.key}
              style={{
                padding: "12px 42px", borderRadius: "19px 19px 0 0", border: "none",
                background: activeTab === tab.key ? `linear-gradient(90deg,${tab.color} 70%,#fff0 100%)` : "#2a2240",
                color: activeTab === tab.key ? "#fff" : "#c8a0f5",
                fontWeight: "bold", fontSize: 20,
                boxShadow: activeTab === tab.key ? "0 2px 16px #0008" : "none",
                cursor: "pointer", marginRight: 18, outline: "none", transition: "all .19s"
              }}
              onClick={() => { setActiveTab(tab.key); setSelected([]); }}
              disabled={activeTab === tab.key || loadingAction}
            >{tab.label}</button>
          )}
        </div>
        {mensaje && (
          <div style={{
            background: "#3b2548", color: "#fff", borderRadius: 12, padding: "13px 24px",
            margin: "13px 0 18px", textAlign: "center", fontSize: 18, fontWeight: 600, minHeight: 42
          }}>{mensaje}</div>
        )}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px,1fr))",
          gap: 28, maxHeight: 380, overflowY: "auto", marginTop: 22
        }}>
          {nfts.length === 0 && !mensaje && <div style={{ color: "#eee" }}>No tienes NFTs en este grupo.</div>}
          {nfts.map(nft => {
            let videoSrc = nft.data?.video || nft.data?.img;
            if (videoSrc && videoSrc.startsWith("Qm")) videoSrc = `https://ipfs.io/ipfs/${videoSrc}`;
            if (!videoSrc) return null;
            return (
              <div
                key={nft.asset_id}
                onClick={() => !loadingAction && toggleSelect(nft.asset_id)}
                style={{
                  border: selected.includes(nft.asset_id)
                    ? `4px solid ${activeTab === "girls" ? "#ff36ba" : "#7e47f7"}`
                    : "3px solid #221e3d",
                  borderRadius: "32px", padding: 6,
                  background: "#191423",
                  cursor: "pointer",
                  boxShadow: selected.includes(nft.asset_id)
                    ? "0 2px 30px #ff36ba44"
                    : "0 2px 18px #0007",
                  transition: "all .17s"
                }}
              >
                <video
                  src={videoSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={videoStyle}
                />
              </div>
            );
          })}
        </div>
        {/* Acción principal */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 34 }}>
          <button
            style={{
              background: "linear-gradient(90deg,#ff36ba 30%,#7e47f7 100%)",
              color: "#fff", border: "none", borderRadius: 13,
              fontSize: 21, fontWeight: "bold", padding: "15px 55px",
              cursor: selected.length === 0 || loadingAction ? "not-allowed" : "pointer",
              opacity: selected.length === 0 || loadingAction ? 0.6 : 1,
              boxShadow: "0 2px 16px #7e47f799"
            }}
            onClick={() => onAction(selected, setMensaje)}
            disabled={selected.length === 0 || loadingAction}
          >{action === "stake" ? "Stakear seleccionados" : "Unstake seleccionados"}</button>
        </div>
      </div>
    </div>
  ) : null;
}

// --- PRINCIPAL, los botones afuera del modal
export default function StakingMain() {
  const [modal, setModal] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Solo función visual para stake y unstake por ahora
  const fakeAction = async (selected, setMensaje) => {
    setLoadingAction(true);
    setMensaje("Firmando transacción...");
    setTimeout(() => {
      setMensaje("¡Transacción simulada completada!");
      setLoadingAction(false);
      setTimeout(() => setModal(null), 1200);
    }, 1500);
  };

  // Botones principales
  return (
    <div style={{ margin: "0 auto", maxWidth: 1050, padding: 0, display: "flex", gap: 32, marginBottom: 32 }}>
      <button
        style={{
          background: "linear-gradient(90deg,#ff36ba 0%,#7e47f7 100%)",
          color: "#fff", border: "none", borderRadius: 13, fontSize: 22, fontWeight: "bold",
          padding: "17px 55px", boxShadow: "0 3px 18px #7e47f788", cursor: "pointer"
        }}
        onClick={() => setModal("stake")}
      >Staking NFTs</button>
      <button
        style={{
          background: "#f43f5e",
          color: "#fff", border: "none", borderRadius: 13, fontSize: 22, fontWeight: "bold",
          padding: "17px 50px", marginLeft: 12, boxShadow: "0 3px 18px #f43f5e66", cursor: "pointer"
        }}
        onClick={() => setModal("unstake")}
      >Unstake</button>
      <button
        style={{
          background: "linear-gradient(90deg,#5eead4 0%,#3b82f6 100%)",
          color: "#222", border: "none", borderRadius: 13, fontSize: 22, fontWeight: "bold",
          padding: "17px 45px", marginLeft: 12, boxShadow: "0 3px 18px #22d3ee99", cursor: "pointer"
        }}
        onClick={() => alert("Función de claim no implementada aún.")}
      >Claim</button>
      {/* Modales */}
      <NFTModal
        open={modal === "stake"}
        onClose={() => setModal(null)}
        schemaTabs={SCHEMAS}
        action="stake"
        onAction={fakeAction}
        loadingAction={loadingAction}
      />
      <NFTModal
        open={modal === "unstake"}
        onClose={() => setModal(null)}
        schemaTabs={SCHEMAS}
        action="unstake"
        onAction={fakeAction}
        loadingAction={loadingAction}
      />
    </div>
  );
}
