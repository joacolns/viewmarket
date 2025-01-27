const CryptoInput = ({ crypto, setCrypto }) => {
    return (
      <input
        type="text"
        value={crypto}
        onChange={(e) => setCrypto(e.target.value.toUpperCase())}
        className="relative z-10 p-3 border rounded-md w-full md:w-1/12 bg-white"
        placeholder="Symbol"
      />
    );
  };
  
  export default CryptoInput;