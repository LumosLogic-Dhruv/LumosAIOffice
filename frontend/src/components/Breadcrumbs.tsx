import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav className="flex items-center gap-1 text-sm text-gray-400 mb-4">
    {items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      return (
        <span key={idx} className="flex items-center gap-1">
          {idx > 0 && <ChevronRight size={14} className="text-gray-300 shrink-0" />}
          {isLast || !item.href ? (
            <span className={isLast ? 'text-gray-700 font-medium' : 'text-gray-400'}>{item.label}</span>
          ) : (
            <Link to={item.href} className="hover:text-gray-600 transition-colors">{item.label}</Link>
          )}
        </span>
      );
    })}
  </nav>
);

export default Breadcrumbs;
