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
      {/* Overlay del título, centro-centro */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          pointerEvents: "none"
        }}
      >
        <span
          style={{
            fontFamily: "'Pacifico', cursive, Arial",
            fontSize: "5.2rem",
            color: "#ff36ba",
            textShadow: "0 8px 42px #201028c8, 0 2px 7px #000c",
            letterSpacing: 2,
            background: "rgba(32,18,48,0.25)",
            borderRadius: 28,
            padding: "20px 80px",
            userSelect: "none",
            fontWeight: "bold",
            border: "2.5px solid #ff36ba44",
            boxShadow: "0 1.5px 22px #fff1"
          }}
        >
          Night Club Game
        </span>
      </div>

      {/* Grid de videos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "1fr",
          gap: "20px",
          height: "100%",
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "36px 2vw 28px 2vw"
        }}
      >
        {gallery.map((vid, idx) => (
          <div
            key={idx}
            className="blur-video-container"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {vid ? (
              <div
                className="video-blur"
                style={{
                  width: "100%",
                  aspectRatio: "9/16",
                  borderRadius: "32px",
                  boxShadow: "0 10px 38px #1f003788, 0 1.5px 10px #ff36ba40",
                  overflow: "hidden",
                  background: "#161425",
                  position: "relative"
                }}
              >
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
                    borderRadius: "32px",
                    transition: "filter 0.4s cubic-bezier(.22,1,.36,1), transform 0.28s cubic-bezier(.22,1,.36,1)",
                    filter: "blur(20px) brightness(0.82) saturate(1.1)" // valor normal
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.filter = "blur(10px) brightness(0.93) saturate(1.15)")
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.filter = "blur(20px) brightness(0.82) saturate(1.1)")
                  }
                />
              </div>
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
