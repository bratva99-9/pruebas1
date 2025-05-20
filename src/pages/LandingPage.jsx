import React, { useEffect, useState, useRef } from "react";

const CARD_COUNT = 4;
const CHANGE_INTERVAL = 5000; // 5 segundos

export default function Main() {
  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState(Array(CARD_COUNT).fill(null));
  const timerRef = useRef();

  // Cargar videos de la colección
  useEffect(() => {
    fetch("https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=nightclubnft&schema_name=photos&page=1&limit=100")
      .then(res => res.json())
      .then(json => {
        const vids = json.data
          .map(a => a.data?.video || a.data?.img || null)
          .filter(Boolean)
          .map(ipfs =>
            ipfs.startsWith("Qm") ? `https://ipfs.io/ipfs/${ipfs}` : ipfs
          );
        setVideos(vids);
        setGallery(Array(CARD_COUNT).fill(0).map(() => vids[Math.floor(Math.random() * vids.length)]));
      });
  }, []);

  // Cambiar solo un video cada X segundos
  useEffect(() => {
    if (!videos.length) return;
    timerRef.current = setInterval(() => {
      setGallery(prev => {
        const idx = Math.floor(Math.random() * CARD_COUNT);
        const newGallery = [...prev];
        let newVideo;
        do {
          newVideo = videos[Math.floor(Math.random() * videos.length)];
        } while (newVideo === newGallery[idx] && videos.length > 1);
        newGallery[idx] = newVideo;
        return newGallery;
      });
    }, CHANGE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [videos]);

  return (
    <div style={{
      width: "100vw", height: "calc(100vh - 80px)",
      position: "relative", overflow: "hidden",
      background: "#181824"
    }}>
      {/* Overlay de título */}
      <div style={{
        position: "absolute", top: "30px", left: 0, right: 0,
        textAlign: "center", zIndex: 10,
        pointerEvents: "none"
      }}>
        <span style={{
          fontFamily: "'Pacifico', cursive, Arial",
          fontSize: "3.2rem",
          color: "#ff36ba",
          textShadow: "0 8px 32px #201028bb, 0 2px 4px #000a",
          letterSpacing: 2,
          background: "rgba(32,18,48,0.28)",
          borderRadius: 22,
          padding: "10px 44px",
          userSelect: "none"
        }}>
          Night Club Game
        </span>
      </div>

      {/* Grid de videos */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "1fr",
        gap: "16px",
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        padding: "56px 3vw 16px 3vw"
      }}>
        {gallery.map((vid, idx) => (
          <div key={idx} style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {vid ? (
              <div style={{
                width: "100%",
                aspectRatio: "9/16", // Mantén proporción vertical
                borderRadius: "34px",
                boxShadow: "0 10px 38px #1f003788, 0 1.5px 10px #ff36ba40",
                overflow: "hidden",
                background: "#161425"
              }}>
                <video
                  src={vid}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "34px"
                  }}
                />
              </div>
            ) : (
              <div style={{
                color: "#fff", fontSize: 24, width: "100%",
                textAlign: "center", paddingTop: "60%"
              }}>Cargando...</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
