const StockInput = ({ stock, setStock }) => {
  return (
    <input
    type="text"
    value={stock}
    onChange={(e) => setStock(e.target.value.toUpperCase())}
    className="relative z-10 p-3 border rounded-md w-full md:w-1/12"
      style={{
        backgroundColor: 'var(--card-bg)', // Fondo basado en el tema
        color: 'var(--card-text)', // Texto basado en el tema
        borderColor: 'var(--secondary)', // Borde basado en el tema
      }}
      placeholder="Stock"
    />
  );
};
  
  export default StockInput;