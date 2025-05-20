import React, { useEffect, useState } from 'react';
import { UserService } from '../UserService';

const COLLECTION = "nightclubcol"; // Mainnet collection name

const MyNFTs = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStaking, setShowStaking] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      if (!UserService.authName) {
        setNfts([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${UserService.authName}&collection_name=${COLLECTION}`);
        const data = await res.json();
        setNfts(data.data || []);
      } catch (err) {
        setNfts([]);
      }
      setLoading(false);
    };
    fetchNFTs();
  }, [UserService.authName]);

  const toggleSelect = (asset_id) => {
    setSelected(prev =>
      prev.includes(asset_id) ? prev.filter(id => id !== asset_id) : [...prev, asset_id]
    );
  };

  const stakeSelectedNFTs = async () => {
    if (!UserService.session) return alert("Debes iniciar sesión.");
    if (selected.length === 0) return alert("Selecciona al menos un NFT.");
    try {
      await UserService.session.signTransaction(
        {
          actions: [{
            account: "atomicassets",
            name: "transfer",
            authorization: [{
              actor: UserService.authName,
              permission: "active",
            }],
            data: {
              from: UserService.authName,
              to: "nightclubapp",
              asset_ids: selected,
              memo: UserService.authName,
            }
          }]
        },
        { blocksBehind: 3, expireSeconds: 60 }
      );
      alert(`NFT${selected.length > 1 ? 's' : ''} enviados a staking.`);
      setShowStaking(false);
      setSelected([]);
      const res = await fetch(`https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${UserService.authName}&collection_name=${COLLECTION}`);
      const data = await res.json();
      setNfts(data.data || []);
    } catch (err) {
      alert("Error al enviar los NFTs: " + (err.message || err));
    }
  };

  return (
    <div>
      <h2 style={{color: "#fff", marginTop: 30}}>Tus NFTs</h2>
      <button
        style={{
          margin: "20px 0",
          padding: "10px 25px",
          background: "#5325e9",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer"
        }}
        onClick={() => setShowStaking(!showStaking)}
      >
        Staking NFTs
      </button>

      {showStaking && (
        <div style={{
          background: "#1a133a",
          borderRadius: 18,
          padding: 20,
          marginTop: 10,
          marginBottom: 20,
          boxShadow: "0 6px 24px #000b",
        }}>
          <h3 style={{color:"#fff"}}>Selecciona los NFTs que quieres stakear</h3>
          {loading ? <div>Cargando NFTs...</div> :
            nfts.length === 0 ? <div>No tienes NFTs disponibles.</div> :
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 28}}>
              {nfts.map(nft => {
                const vidHash = nft.data?.video;
                const imgHash = nft.data?.img;
                const fileUrl = vidHash && vidHash.length > 10
                  ? (vidHash.startsWith("http") ? vidHash : `https://ipfs.io/ipfs/${vidHash}`)
                  : (imgHash && imgHash.length > 10
                    ? (imgHash.startsWith("http") ? imgHash : `https://ipfs.io/ipfs/${imgHash}`)
                    : '');

                return (
                  <div
                    key={nft.asset_id}
                    style={{
                      width: 200, borderRadius: 16,
                      background: selected.includes(nft.asset_id) ? "#302170" : "#222",
                      padding: 8, boxShadow: "0 2px 12px #000a", display:"flex", flexDirection:"column", alignItems:"center"
                    }}
                    onClick={() => toggleSelect(nft.asset_id)}
                  >
                    <video
                      src={fileUrl}
                      style={{width:"100%", height:270, borderRadius:12, background:"#19191d"}}
                      autoPlay loop muted playsInline
                    />
                    <input
                      type="checkbox"
                      checked={selected.includes(nft.asset_id)}
                      onChange={() => toggleSelect(nft.asset_id)}
                      style={{marginTop:8}}
                    /> Seleccionar
                  </div>
                );
              })}
            </div>
          }
          <button
            style={{
              marginTop: 18,
              padding: "8px 22px",
              background: "#ff36ba",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer"
            }}
            onClick={stakeSelectedNFTs}
          >
            Stakear seleccionados
          </button>
          <button
            style={{
              marginLeft: 16,
              marginTop: 18,
              padding: "8px 18px",
              background: "#5b5b5b",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: "bold",
              fontSize: 15,
              cursor: "pointer"
            }}
            onClick={() => {setShowStaking(false); setSelected([]);}}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default MyNFTs;
