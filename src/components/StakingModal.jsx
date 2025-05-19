import React, { useEffect, useState } from "react";
import { UserService } from "../UserService";

const SCHEMAS = [
  { key: "girls", label: "Girls", color: "#ff36ba" },
  { key: "photos", label: "Photos", color: "#7e47f7" }
];

const COLLECTION = "nightclubnft";

export default function StakingModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("girls");
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [unstaking, setUnstaking] = useState(false);

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

  const toggleSelect = (assetId) => {
    setSelected((selected) =>
      selected.includes(assetId)
        ? selected.filter((id) => id !== assetId)
        : [...selected, assetId]
    );
  };

  // Staking
  const handleStake = async () => {
    if (!UserService.isLogged() || selected.length === 0) return;
    setLoading(true);
    setMensaje("Firmando transacción...");
    try {
      await UserService.stakeNFTs(selected, "");
      setMensaje("¡Staking realizado con éxito!");
      setSelected([]);
      // Refresca la lista:
      setTimeout(() => {
        setModalOpen(false);
        setMensaje("");
      }, 1700);
    } catch (e) {
      setMensaje("Error al firmar: " + (e.message || e));
    }
    setLoading(false);
  };

  // Unstaking (DEBES programar la lógica real aquí)
  const handleUnstake = async () => {
    setUnstaking(true);
    setMensaje("Procesando unstake...");
    setTimeout(() => {
      setMensaje("Función de Unstake no implementada aún.");
      setUnstaking(false);
    }, 1500);
  };

  // Claim (DEBES programar la lógica real aquí)
  const handleClaim = async () => {
    setClaiming(true);
    setMensaje("Procesando claim...");
    setTimeout(() => {
      setMensaje("Función de Claim no implementada aún.");
      setClaiming(false);
    }, 1500);
  };

  // Estilos tabs y botones
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

  return (
    <>
      <button
        className="px-8 py-4 bg-pink-600 text-white rounded-xl shadow-xl font-bold text-xl transition hover:bg-pink-500 mb-8"
        onClick={() => setModalOpen(true)}
        disabled={!wallet}
        style={{ marginTop: 12, marginBottom: 22 }}
      >
        Staking NFTs
      </button>

      {modalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "rgba(19,15,24,0.96)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#201b2c", borderRadius: 24, minWidth: 380, minHeight: 300,
            boxShadow: "0 10px 36px #000a", padding: 38, position: "relative", maxWidth: 700, width: "98vw"
          }}>
            {/* Cerrar */}
            <button
              onClick={() => { setModalOpen(false); setSelected([]); setMensaje(""); }}
              style={{
                position: "absolute", top: 18, right: 22, fontSize: 33, color: "#cfc", background: "none", border: "none",
                cursor: "pointer", fontWeight: "bold", lineHeight: "1"
              }}
              disabled={loading || claiming || unstaking}
            >&times;</button>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "2.5px solid #433f58", marginBottom: 18 }}>
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

            {mensaje && (
              <div style={{
                background: "#3b2548",
                color: "#fff",
                borderRadius: 9,
                padding: "10px 18px",
                margin: "10px 0 16px",
                textAlign: "center",
                fontSize: 17,
                fontWeight: 600,
                minHeight: 42
              }}>{mensaje}</div>
            )}

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(125px,1fr))",
              gap: 24,
              maxHeight: 340,
              overflowY: "auto",
              marginTop: 18
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
                      borderRadius: "16px",
                      padding: 6,
                      background: selected.includes(nft.asset_id)
                        ? (activeTab === "girls"
                          ? "linear-gradient(135deg,#ff36ba30 60%,#fff0)"
                          : "linear-gradient(135deg,#7e47f720 60%,#fff0)")
                        : "#131025",
                      cursor: "pointer",
                      boxShadow: selected.includes(nft.asset_id) ? "0 4px 18px #444a" : "0 2px 8px #1117",
                      transition: "all .17s"
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
                        height: "170px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        background: "#0c0c0e"
                      }}
                    />
                    <input
                      type="checkbox"
                      checked={selected.includes(nft.asset_id)}
                      onChange={() => toggleSelect(nft.asset_id)}
                      style={{ marginTop: 7, width: 20, height: 20, accentColor: "#ff36ba" }}
                      readOnly
                    /> <span style={{ color: "#eee" }}>Seleccionar</span>
                  </div>
                );
              })}
            </div>
            <div style={{
              display: "flex", justifyContent: "center", gap: 20, marginTop: 32, flexWrap: "wrap"
            }}>
              <button
                style={{
                  background: "linear-gradient(90deg,#ff36ba 30%,#7e47f7 100%)",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: 17, fontWeight: "bold", padding: "12px 36px",
                  cursor: selected.length === 0 || loading ? "not-allowed" : "pointer",
                  opacity: selected.length === 0 || loading ? 0.6 : 1,
                  boxShadow: "0 2px 12px #7e47f799"
                }}
                onClick={handleStake}
                disabled={selected.length === 0 || loading}
              >Stakear seleccionados</button>

              <button
                style={{
                  background: "#f43f5e", // rojo vibrante
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 17,
                  fontWeight: "bold",
                  padding: "12px 36px",
                  cursor: unstaking ? "not-allowed" : "pointer",
                  opacity: unstaking ? 0.6 : 1,
                  boxShadow: "0 2px 8px #f43f5e99"
                }}
                onClick={handleUnstake}
                disabled={unstaking}
              >Unstake</button>
              <button
                style={{
                  background: "linear-gradient(90deg,#5eead4 0%,#3b82f6 100%)",
                  color: "#222",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 17,
                  fontWeight: "bold",
                  padding: "12px 36px",
                  cursor: claiming ? "not-allowed" : "pointer",
                  opacity: claiming ? 0.6 : 1,
                  boxShadow: "0 2px 8px #22d3ee88"
                }}
                onClick={handleClaim}
                disabled={claiming}
              >Claim</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
