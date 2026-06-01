import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';

const Breadcrumb = ({ items }) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <FiChevronRight size={12} className="text-olive/40" />}
            {index === items.length - 1 ? (
              <span className="text-xs font-body font-medium text-forest">{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className="text-xs font-body text-olive hover:text-gold transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </motion.nav>
  );
};

export default Breadcrumb;
