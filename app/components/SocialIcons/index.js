import { FaGithub, FaChartBar } from 'react-icons/fa';
import Link from 'next/link';

const SocialIcons = () => {
  return (
    <div className="icons flex justify-center space-x-8 scroll-mt-7">
      <Link href="https://github.com/njoaco/viewmarket-crypto" target="_blank">
        <FaGithub size={30} className="hover:text-gray-600 transition-colors" />
      </Link>
      <Link href="https://www.coinmarketcap.com" target="_blank">
        <FaChartBar size={30} className="hover:text-gray-600 transition-colors" />
      </Link>
      <div className="border-r-xl version text-s bg-gray-200 rounded-full px-2 py-1">
        v1.1.0
      </div>
    </div>
  );
};

export default SocialIcons;