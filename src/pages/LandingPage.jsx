import React, { useEffect, useState, useRef } from "react";
import '../App.scss';

const CARD_COUNT = 4;
const CHANGE_INTERVAL = 5000; // 5 segundos

export default function Main() {
  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState(Array(CARD_COUNT).fill(null));
  const timerRef = useRef();

  useEffect(() => {
    fetch("https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=nightclubcol&schema_name=photos&page=1&limit=100")
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
    <div className="gigaland-home-container main-blur-gallery">
      <h1 className="gigaland-title titulo-rosado">Night Club Game</h1>
      <section className="gigaland-gallery-section">
        <div className="gigaland-gallery-grid">
          {gallery.map((vid, idx) => (
            <div key={idx} className="gallery-video-card">
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
                    objectFit: "cover",
                    borderRadius: "28px",
                    background: "#000"
                  }}
                />
              ) : (
                <div className="loading">loading...</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
