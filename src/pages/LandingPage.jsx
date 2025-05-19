import React, { useEffect, useState, useRef } from "react";
import '../App.scss';

const CARD_COUNT = 4;
const CHANGE_INTERVAL = 5000; // 5 segundos

export default function Main() {
  const [media, setMedia] = useState([]); // media: video o img
  const [gallery, setGallery] = useState(Array(CARD_COUNT).fill(null));
  const timerRef = useRef();

  // Trae los videos/imágenes de la colección de fotos (mainnet)
  useEffect(() => {
    fetch("https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=nightclubnft&schema_name=photos&page=1&limit=100")
      .then(res => res.json())
      .then(json => {
        // Toma tanto videos como imágenes para mostrar
        const files = json.data
          .map(a => a.data?.video || a.data?.img || null)
          .filter(Boolean)
          .map(ipfs =>
            ipfs.startsWith("Qm") ? `https://ipfs.io/ipfs/${ipfs}` : ipfs
          );
        setMedia(files);
        setGallery(Array(CARD_COUNT).fill(0).map(() => files[Math.floor(Math.random() * files.length)]));
      });
  }, []);

  // Cambia solo un video/imagen cada 5 segundos
  useEffect(() => {
    if (!media.length) return;
    timerRef.current = setInterval(() => {
      setGallery(prev => {
        const idx = Math.floor(Math.random() * CARD_COUNT);
        const newGallery = [...prev];
        let newItem;
        do {
          newItem = media[Math.floor(Math.random() * media.length)];
        } while (newItem === newGallery[idx] && media.length > 1);
        newGallery[idx] = newItem;
        return newGallery;
      });
    }, CHANGE_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [media]);

  return (
    <div className="gigaland-home-container main-blur-gallery">
      <h1 className="gigaland-title titulo-rosado">Night Club Game</h1>
      <section className="gigaland-gallery-section">
        <div className="gigaland-gallery-grid">
          {gallery.map((file, idx) => (
            <div key={idx} className="gallery-video-card">
              {file ? (
                file.endsWith('.mp4') || file.includes('video') ? (
                  <video
                    src={file}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "28px",
                      background: "#000"
                    }}
                  />
                ) : (
                  <img
                    src={file}
                    alt={`NFT ${idx}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "28px",
                      background: "#000"
                    }}
                  />
                )
              ) : (
                <div className="loading">Cargando...</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
