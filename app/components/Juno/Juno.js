
import { Fa500Px } from 'react-icons/fa';

const Juno = ({ query = 'cryptocurrency' }) => {
  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => window.open('https://juno-web-production.up.railway.app/')}
        className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 focus:outline-none"
        aria-label="Mostrar noticias"
      >
        <Fa500Px />
      </button>
    </div>
  );
};

export default Juno;
