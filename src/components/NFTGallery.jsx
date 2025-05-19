import React, { useEffect, useState } from "react";
import { UserService } from "../UserService";

// Utilidad para obtener la url del video
const getVidUrl = (nft) => {
  const vidHash = nft.data && nft.data.video;
  if (!vidHash) return "";
  return vidHash.startsWith("http") ? vidHash : `https://ipfs.io/ipfs/${vidHash}`;
};

// Modal simple (puedes mejorar con una librería como React Modal)
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", zIndex: 9000, top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(14,12,26,0.90)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#191a23",
        borderRadius: 20,
        padding: 32,
        minWidth: 360, minHeight: 240,
        boxShadow: "0 6px 36px #000b",
        position: "relative",
        maxHeight: "85vh",
        overflowY: "auto"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 20,
          background: "transparent", border: "none", fontSize: 28, color: "#bbb", cursor: "pointer"
        }}>&times;</button>
        {children}
      </div>
    </div>
  );
}

const COLLECTION = "nightclubcol"; // <-- TESTNET collection

export default function NFTGallery() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStaking, setShowStaking] = useState(false);
  const [selected, setSelected] = useState([]);
  const [msg, setMsg] = useState("");

  // Cargar NFTs del usuario
  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      setNfts([]);
      if (!UserService.authName) {
        setLoading(false);
        return;
      }
      try {
        // ENDPOINT TESTNET y colección testnet
        const res = await fetch(`https://test.wax.api.atomicassets.io/atomicassets/v1/assets?owner=${UserService.authName}&collection_name=${COLLECTION}`);
        const data = await res.json();
        setNfts(data.data || []);
      } catch (err) {
        setNfts([]);
      }
      setLoading(false);
    };
    fetchNFTs();
  }, [UserService.authName, showStaking]);

  // Seleccionar/deseleccionar
  const toggleSelect = (asset_id) => {
    setSelected(prev =>
      prev.includes(asset_id) ? prev.filter(id => id !== asset_id) : [...prev, asset_id]
    );
  };

  // Stakear los seleccionados
  const stakeSelectedNFTs = async () => {
    if (!UserService.session) return alert("Debes iniciar sesión.");
    if (selected.length === 0) return alert("Selecciona al menos un NFT.");
    setMsg("Firmando transacción...");
    try {
      // Usa la función centralizada para asegurar la lógica correcta
      await UserService.stakeNFTs(selected);
      setMsg("¡NFTs enviados a staking exitosamente! 🎉");
      setShowStaking(false);
      setSelected([]);
      setTimeout(() => setMsg(""), 3000);

      // Recarga NFTs desde testnet
      const res = await fetch(`https://test.wax.api.atomicassets.io/atomicassets/v1/assets?owner=${UserService.authName}&collection_name=${COLLECTION}`);
      const data = await res.json();
      setNfts(data.data || []);
    } catch (err) {
      setMsg("Error al stakear: " + (err.message || err));
    }
  };

  return (
    <div style={{padding: 0, maxWidth: 1200, margin: "0 auto"}}>
      {/* HEADER */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100, background: "rgba(24,20,36,0.95)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px", borderBottom: "1.5px solid #383359"
      }}>
        <div style={{display: "flex", alignItems: "center"}}>
          <img src="/logo512.png" alt="Logo" style={{height: 46, borderRadius: 16, boxShadow: "0 3px 10px #0008"}}/>
          <span style={{marginLeft: 18, color: "#fff", fontSize: 26, fontWeight: 800, letterSpacing: 1}}>Night Club Game</span>
        </div>
        <div style={{color:"#ff36ba", fontWeight:"bold", fontSize:18}}>
          {UserService.authName && <span>{UserService.authName}</span>}
          {/* Aquí puedes mostrar también los balances de WAX y SEXY */}
        </div>
        <button
          style={{
            background: "linear-gradient(90deg,#7e47f7 0%,#ff36ba 100%)",
            color: "#fff", border: "none", borderRadius: 12, fontSize: 19, fontWeight: "bold",
            padding: "12px 32px", boxShadow: "0 2px 12px #7e47f799", cursor: "pointer"
          }}
          onClick={() => setShowStaking(true)}
        >
          <span role="img" aria-label="stake">💎</span> Staking NFTs
        </button>
      </div>

      {/* MENSAJE DE FEEDBACK */}
      {msg && <div style={{
        margin: "28px auto 0", maxWidth: 440, padding: "16px 24px", borderRadius: 14,
        background: "#251638", color: "#fff", fontSize: 18, textAlign: "center", boxShadow:"0 2px 14px #0006"
      }}>{msg}</div>}

      {/* GALERÍA */}
      <div style={{
        marginTop: 40,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: 36
      }}>
        {loading ? (
          <div style={{color: "#fff", fontSize: 24}}>Cargando NFTs...</div>
        ) : nfts.length === 0 ? (
          <div style={{color: "#fff", fontSize: 20, gridColumn: "1/-1"}}>No tienes NFTs de esta colección.</div>
        ) : nfts.map(nft => {
          const vidURL = getVidUrl(nft);
          return (
            <div key={nft.asset_id}
              style={{
                background: "linear-gradient(145deg,#232848 80%, #181828 100%)",
                borderRadius: 18, boxShadow: "0 6px 20px #0008",
                padding: 0, overflow: "hidden", cursor: "pointer",
                transition: "transform .18s,box-shadow .22s",
                border: "3px solid #232848"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 30px #ff36ba77"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 6px 20px #0008"}
              onClick={() => setShowStaking(true)}
            >
              <video
                src={vidURL}
                style={{
                  width: "100%", height: 310, objectFit: "contain",
                  background: "#19191d", borderRadius: "0 0 15px 15px", display:"block"
                }}
                autoPlay loop muted playsInline
              />
              {/* Puedes agregar más detalles abajo si quieres */}
            </div>
          );
        })}
      </div>

      {/* MODAL DE STAKING */}
      <Modal open={showStaking} onClose={() => { setShowStaking(false); setSelected([]); }}>
        <h2 style={{color:"#fff", fontWeight:800, fontSize:24, marginBottom:12, textAlign:"center"}}>Selecciona tus NFTs para staking</h2>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 22,
          maxWidth: 700, margin: "24px auto"
        }}>
          {nfts.length === 0
            ? <div style={{color: "#fff"}}>No tienes NFTs.</div>
            : nfts.map(nft => {
              const vidURL = getVidUrl(nft);
              return (
                <div key={nft.asset_id}
                  style={{
                    background: selected.includes(nft.asset_id) ? "linear-gradient(120deg,#7e47f7 70%,#ff36ba 100%)" : "#161928",
                    border: selected.includes(nft.asset_id) ? "3px solid #ff36ba" : "2px solid #242",
                    borderRadius: 14, padding: 8,
                    boxShadow: selected.includes(nft.asset_id) ? "0 2px 18px #ff36ba88" : "0 2px 12px #0007",
                    transition: "all .18s",
                    display:"flex", flexDirection:"column", alignItems:"center"
                  }}
                  onClick={() => toggleSelect(nft.asset_id)}
                >
                  <video
                    src={vidURL}
                    style={{
                      width:"100%", height:105, borderRadius:10, background:"#19191d",
                      boxShadow: selected.includes(nft.asset_id) ? "0 0 8px #fff5" : undefined
                    }}
                    autoPlay loop muted playsInline
                  />
                  <input
                    type="checkbox"
                    checked={selected.includes(nft.asset_id)}
                    onChange={() => toggleSelect(nft.asset_id)}
                    style={{marginTop:8, width:20, height:20, accentColor: "#ff36ba"}}
                    readOnly
                  />
                </div>
              );
            })
          }
        </div>
        <div style={{display:"flex", justifyContent:"center", marginTop:18}}>
          <button
            style={{
              background: "linear-gradient(90deg,#7e47f7 0%,#ff36ba 100%)",
              color: "#fff", border: "none", borderRadius: 10, fontSize: 17, fontWeight: "bold",
              padding: "12px 36px", marginRight:16, cursor:"pointer"
            }}
            onClick={stakeSelectedNFTs}
          >Stakear seleccionados</button>
          <button
            style={{
              background: "#666", color: "#fff", border: "none",
              borderRadius: 10, fontSize: 17, fontWeight: "bold", padding: "12px 36px",
              cursor:"pointer"
            }}
            onClick={() => { setShowStaking(false); setSelected([]); }}
          >Cancelar</button>
        </div>
      </Modal>
    </div>
  );
}
