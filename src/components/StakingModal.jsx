import React, { useState, useEffect } from "react";
import { UserService } from "../UserService";
import { JsonRpc } from "eosjs";

const rpc = new JsonRpc("https://wax.greymass.com"); // MAINNET

export default function StakingModal() {
  const [nfts, setNfts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const wallet = UserService.isLogged() ? UserService.getName() : null;

  // Verificar si el usuario está registrado
  const checkRegistration = async (username) => {
    try {
      const result = await rpc.get_table_rows({
        json: true,
        code: "nightclubapp",
        scope: "nightclubapp",
        table: "users",
        lower_bound: username,
        upper_bound: username,
        limit: 1,
      });
      const found = result.rows.length > 0 && result.rows[0].user === username;
      setIsRegistered(found);
      return found;
    } catch (err) {
      console.error("Error al verificar registro:", err);
      setIsRegistered(false);
      return false;
    }
  };

  // Cargar NFTs y verificar si está registrado
  useEffect(() => {
    if (modalOpen && wallet) {
      setMensaje("Cargando NFTs...");
      fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=nightclubnft&owner=${wallet}&limit=100`)
        .then(res => res.json())
        .then(json => {
          setNfts(Array.isArray(json.data) ? json.data : []);
          setMensaje("");
        })
        .catch(() => {
          setMensaje("Error al cargar tus NFTs");
          setNfts([]);
        });

      checkRegistration(wallet);
    }
  }, [modalOpen, wallet]);

  const toggleSelect = (assetId) => {
    setSelected(selected =>
      selected.includes(assetId)
        ? selected.filter(id => id !== assetId)
        : [...selected, assetId]
    );
  };

  const handleStake = async () => {
    if (!UserService.isLogged() || selected.length === 0) return;
    setLoading(true);
    setMensaje("Preparando transacción...");

    try {
      // 1. Registrar si no está registrado
      if (!isRegistered) {
        setMensaje("Registrando usuario...");
        await UserService.session.signTransaction(
          {
            actions: [{
              account: "nightclubapp",
              name: "regnewuser",
              authorization: [{
                actor: UserService.getName(),
                permission: "active"
              }],
              data: {
                user: UserService.getName(),
                referrer: UserService.getName()
              }
            }]
          },
          { blocksBehind: 3, expireSeconds: 60 }
        );
        setIsRegistered(true); // evitar repetir
        await new Promise(res => setTimeout(res, 1000));
      }

      // 2. Transferir NFTs
      setMensaje("Enviando NFTs a staking...");
      await UserService.session.signTransaction(
        {
          actions: [{
            account: "atomicassets",
            name: "transfer",
            authorization: [{
              actor: UserService.getName(),
              permission: "active"
            }],
            data: {
              from: UserService.getName(),
              to: "nightclubapp",
              asset_ids: selected,
              memo: UserService.getName()
            }
          }]
        },
        { blocksBehind: 3, expireSeconds: 60 }
      );

      setMensaje("¡Staking realizado con éxito!");
      setSelected([]);
      setTimeout(() => {
        setModalOpen(false);
        setMensaje("");
      }, 2000);
    } catch (e) {
      setMensaje("Error: " + (e.message || e));
    }

    setLoading(false);
  };

  return (
    <>
      <button
        className="px-8 py-4 bg-pink-600 text-white rounded-xl shadow-xl font-bold text-xl transition hover:bg-pink-500 mb-8"
        onClick={() => setModalOpen(true)}
        disabled={!wallet}
      >
        Staking
      </button>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-2xl shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl"
              aria-label="Cerrar"
              disabled={loading}
            >&times;</button>
            <h2 className="text-2xl font-bold text-white mb-6">
              Selecciona tus NFTs para Staking
            </h2>
            {mensaje && (
              <div className="text-pink-400 mb-2">{mensaje}</div>
            )}
            <div className="staking-grid max-h-[50vh] overflow-y-auto">
              {nfts.length === 0 && !mensaje && (
                <div className="text-white col-span-4">No tienes NFTs para mostrar.</div>
              )}
              {nfts.map(nft => {
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
                    className={
                      "staking-video-thumb" +
                      (selected.includes(nft.asset_id) ? " selected" : "")
                    }
                  >
                    <video
                      src={videoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{
                        width: "112px",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "14px",
                        background: "#000"
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <button
              className={`mt-8 w-full py-3 bg-pink-600 text-white font-bold rounded-xl shadow-lg transition hover:bg-pink-500 ${
                selected.length === 0 || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleStake}
              disabled={selected.length === 0 || loading}
            >
              {loading ? "Enviando..." : `Stakear ${selected.length} NFT${selected.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
