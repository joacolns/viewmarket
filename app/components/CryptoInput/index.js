const CryptoInput = ({ crypto, setCrypto }) => {
  return (
    <input
      type="text"
      value={crypto}
      onChange={(e) => setCrypto(e.target.value.toUpperCase())}
      className="relative z-10 p-3 border rounded-md w-full md:w-1/12"
      style={{
        backgroundColor: 'var(--card-bg)', // Fondo basado en el tema
        color: 'var(--card-text)', // Texto basado en el tema
        borderColor: 'var(--secondary)', // Borde basado en el tema
      }}
      placeholder="Token"
    />
  );
};

export default CryptoInput;