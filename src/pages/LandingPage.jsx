import React, { useEffect, useState, useRef } from "react";

const CARD_COUNT = 4;
const CHANGE_INTERVAL = 5000; // 5 segundos

export default function Main() {
  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState(Array(CARD_COUNT).fill(null));
  const timerRef = useRef();

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
    <div
      style={{
        width: "100vw",
        height: "calc(100vh - 80px)",
        position: "relative",
        overflow: "hidden",
        background: "#181824"
      }}
      className="main-blur-gallery"
    >
      {/* Título centrado perfectamente */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          pointerEvents: "none",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <span
          style={{
            fontFamily: "'Pacifico', cursive, Arial",
            fontSize: "6.5vw", // Escalado responsivo
            color: "#ff36ba",
            textShadow: "0 3px 24px #170415cc, 0 1.5px 8px #000c",
            letterSpacing: 2,
            userSelect: "none",
            fontWeight: "bold"
          }}
        >
          Night Club Game
        </span>
      </div>

      {/* Grid de videos, sin bordes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "1fr",
          gap: "24px",
          height: "100%",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "28px 2vw 28px 2vw",
          background: "transparent"
        }}
      >
        {gallery.map((vid, idx) => (
          <div
            key={idx}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none"
            }}
          >
            {vid ? (
              <video
                src={vid}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  aspectRatio: "9/16",
                  objectFit: "cover",
                  borderRadius: "32px", // Borde suave solo para elegancia
                  transition: "filter 0.38s cubic-bezier(.22,1,.36,1)",
                  filter: "blur(18px) brightness(0.85) saturate(1.1)"
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.filter = "blur(9px) brightness(1.03) saturate(1.13)")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.filter = "blur(18px) brightness(0.85) saturate(1.1)")
                }
              />
            ) : (
              <div
                style={{
                  color: "#fff",
                  fontSize: 24,
                  width: "100%",
                  textAlign: "center",
                  paddingTop: "60%"
                }}
              >
                Cargando...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
