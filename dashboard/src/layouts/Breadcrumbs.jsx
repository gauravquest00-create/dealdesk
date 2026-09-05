import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';
import './Breadcrumbs.css';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x && x !== 'app');

  return (
    <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
      <Link to="/app" className="breadcrumb-item">Workspace</Link>
      {pathnames.map((name, idx) => {
        const routeTo = `/app/${pathnames.slice(0, idx + 1).join('/')}`;
        const isLast = idx === pathnames.length - 1;
        const formatted = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

        return (
          <React.Fragment key={routeTo}>
            <FaChevronRight className="breadcrumb-separator" />
            {isLast ? (
              <span className="breadcrumb-current">{formatted}</span>
            ) : (
              <Link to={routeTo} className="breadcrumb-item">{formatted}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
