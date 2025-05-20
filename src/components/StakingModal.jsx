import React, { useEffect, useState } from "react";
import { UserService } from "../UserService";

const SCHEMAS = [
  { key: "girls", label: "Girls", color: "#ff36ba" },
  { key: "photos", label: "Photos", color: "#7e47f7" }
];
const COLLECTION = "nightclubnft";

export default function StakingModal({ isUnstake = false }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("girls");
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [claiming, setClaiming] = useState(false);

  const wallet = UserService.isLogged() ? UserService.getName() : null;

  // Cargar NFTs por schema
  useEffect(() => {
    if (modalOpen && wallet) {
      setMensaje("Cargando NFTs...");
      setLoading(true);
      fetch(
        `https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=${COLLECTION}&owner=${wallet}&schema_name=${activeTab}&limit=100`
      )
        .then((res) => res.json())
        .then((json) => {
          setNfts(Array.isArray(json.data) ? json.data : []);
          setMensaje("");
        })
        .catch(() => {
          setMensaje("Error al cargar tus NFTs");
          setNfts([]);
        })
        .finally(() => setLoading(false));
    }
  }, [modalOpen, wallet, activeTab]);

  // Selección visual, solo borde
  const toggleSelect = (assetId) => {
    setSelected((selected) =>
      selected.includes(assetId)
        ? selected.filter((id) => id !== assetId)
        : [...selected, assetId]
    );
  };

  // Stake/Unstake real: transacción a nightclub.gm sin memo
  const handleStakeOrUnstake = async () => {
    if (!UserService.isLogged() || selected.length === 0) return;
    setLoading(true);
    setMensaje(isUnstake ? "Firmando Unstake..." : "Firmando Staking...");
    try {
      await UserService.stakeNFTs(selected, ""); // Sin memo
      setMensaje(isUnstake ? "¡Unstake realizado con éxito!" : "¡Staking realizado con éxito!");
      setSelected([]);
      setTimeout(() => {
        setModalOpen(false);
        setMensaje("");
      }, 1700);
    } catch (e) {
      setMensaje("Error al firmar: " + (e.message || e));
    }
    setLoading(false);
  };

  // Claim (placeholder, no implementado)
  const handleClaim = async () => {
    setClaiming(true);
    setMensaje("Procesando claim... [lógica por implementar]");
    setTimeout(() => {
      setMensaje("Función de Claim no implementada aún.");
      setClaiming(false);
    }, 1500);
  };

  // --- ESTILOS ---
  const cardHeight = 210; // px (ajusta este tamaño a gusto)

  const tabStyle = (tab) => ({
    padding: "10px 32px",
    borderRadius: "16px 16px 0 0",
    border: "none",
    background: activeTab === tab.key
      ? `linear-gradient(90deg,${tab.color} 70%,#fff0 100%)`
      : "#1c1932",
    color: activeTab === tab.key ? "#fff" : "#c8a0f5",
    fontWeight: "bold",
    fontSize: 18,
    boxShadow: activeTab === tab.key ? "0 2px 16px #0008" : "none",
    cursor: "pointer",
    marginRight: 14,
    outline: "none",
    transition: "all .19s"
  });

  // --- BOTONES PRINCIPALES ---
  const mainBtn = (label, color, onClick, disabled = false) => (
    <button
      style={{
        background: color,
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
        border: "none",
        borderRadius: 14,
        padding: "12px 38px",
        margin: "0 16px",
        boxShadow: "0 4px 24px #0002",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all .18s"
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );

  // --- RENDER ---
  return (
    <>
      {/* Botones en Home */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 24, margin: "42px 0 32px"
      }}>
        {mainBtn("Staking NFTs", "linear-gradient(90deg,#a259ff 30%,#ff36ba 100%)", () => { setModalOpen(true); setActiveTab("girls"); }, !wallet)}
        {mainBtn("Unstake", "#f43f5e", () => { setModalOpen(true); setActiveTab("girls"); }, !wallet)}
        {mainBtn("Claim", "linear-gradient(90deg,#5eead4 0%,#3b82f6 100%)", handleClaim, claiming || !wallet)}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "rgba(19,15,24,0.96)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#201b2c", borderRadius: 24, minWidth: 380, minHeight: 300,
            boxShadow: "0 10px 36px #000a", padding: 32, position: "relative", maxWidth: 700, width: "95vw"
          }}>
            {/* Cerrar */}
            <button
              onClick={() => { setModalOpen(false); setSelected([]); setMensaje(""); }}
              style={{
                position: "absolute", top: 16, right: 20, fontSize: 33, color: "#cfc", background: "none", border: "none",
                cursor: "pointer", fontWeight: "bold", lineHeight: "1"
              }}
              disabled={loading || claiming}
            >&times;</button>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "2.5px solid #433f58", marginBottom: 16 }}>
              {SCHEMAS.map(tab =>
                <button
                  key={tab.key}
                  style={tabStyle(tab)}
                  onClick={() => { setActiveTab(tab.key); setSelected([]); }}
                  disabled={activeTab === tab.key || loading}
                >
                  {tab.label}
                </button>
              )}
            </div>
            {/* Mensaje de feedback */}
            {mensaje && (
              <div style={{
                background: "#3b2548",
                color: "#fff",
                borderRadius: 9,
                padding: "10px 18px",
                margin: "10px 0 16px",
                textAlign: "center",
                fontSize: 16,
                fontWeight: 600,
                minHeight: 38
              }}>{mensaje}</div>
            )}

            {/* Galería NFTs */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(135px,1fr))",
              gap: 20,
              maxHeight: 290,
              overflowY: "auto",
              marginTop: 12,
              justifyItems: "center"
            }}>
              {loading ? (
                <div style={{ color: "#fff" }}>Cargando NFTs...</div>
              ) : nfts.length === 0 ? (
                <div style={{ color: "#eee" }}>No tienes NFTs en este grupo.</div>
              ) : nfts.map(nft => {
                let videoSrc = nft.data?.video;
                if (videoSrc && videoSrc.startsWith("Qm")) {
                  videoSrc = `https://ipfs.io/ipfs/${videoSrc}`;
                }
                if (!videoSrc && nft.data?.img) {
                  videoSrc = nft.data.img.startsWith("Qm")
                    ? `https://ipfs.io/ipfs/${nft.data.img}`
                    : nft.data.img;
                }
                if (!videoSrc) return null;
                return (
                  <div
                    key={nft.asset_id}
                    onClick={() => !loading && toggleSelect(nft.asset_id)}
                    style={{
                      border: selected.includes(nft.asset_id) ? `3px solid ${activeTab === "girls" ? "#ff36ba" : "#7e47f7"}` : "2px solid #252241",
                      borderRadius: "22px",
                      background: selected.includes(nft.asset_id)
                        ? (activeTab === "girls"
                          ? "linear-gradient(135deg,#ff36ba25 60%,#fff0)"
                          : "linear-gradient(135deg,#7e47f730 60%,#fff0)")
                        : "#131025",
                      cursor: "pointer",
                      boxShadow: selected.includes(nft.asset_id) ? "0 4px 16px #444a" : "0 2px 8px #1117",
                      transition: "all .17s",
                      width: "120px",
                      height: `${cardHeight}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                      overflow: "hidden"
                    }}
                  >
                    <video
                      src={videoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "20px",
                        background: "#0c0c0e"
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Botón stake/unstake */}
            <div style={{
              display: "flex", justifyContent: "center", marginTop: 26
            }}>
              <button
                style={{
                  background: "linear-gradient(90deg,#a259ff 30%,#ff36ba 100%)",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: 17, fontWeight: "bold", padding: "11px 32px",
                  cursor: selected.length === 0 || loading ? "not-allowed" : "pointer",
                  opacity: selected.length === 0 || loading ? 0.65 : 1,
                  boxShadow: "0 2px 12px #7e47f799"
                }}
                onClick={handleStakeOrUnstake}
                disabled={selected.length === 0 || loading}
              >
                {isUnstake ? "Unstake seleccionados" : "Stakear seleccionados"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
