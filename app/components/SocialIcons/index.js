import { FaGithub, FaCoins, FaViacoin } from 'react-icons/fa';
import Link from 'next/link';

const SocialIcons = () => {
  return (
    <div className="icons flex justify-center space-x-8 scroll-mt-7">
      <Link href="https://github.com/njoaco/viewmarket-crypto" target="_blank">
        <FaGithub
          size={25}
          className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        />
      </Link>
      <Link href="https://www.coinmarketcap.com" target="_blank">
        <FaCoins
          size={25}
          className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        />
      </Link>
      <Link href="https://github.com/njoaco/juno-model" target="_blank">
        <FaViacoin
          size={25}
          className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        />
      </Link>
      <div
        className="version text-xs rounded-full px-2 py-1"
        style={{
          backgroundColor: 'var(--card-bg)',
          color: 'var(--card-text)',
        }}
      >
        v1.1.0
      </div>
    </div>
  );
};

export default SocialIcons;