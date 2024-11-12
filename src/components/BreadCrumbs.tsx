import React from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import "./BreadCrumbs.css";

interface ICrumb {
  label: string;
  path?: string;
}

interface BreadCrumbsProps {
  crumbs: ICrumb[];
}

export const BreadCrumbs: React.FC<BreadCrumbsProps> = ({ crumbs }) => {
  return (
    <Container className="breadcrumbs-container">
      <ul className="breadcrumbs">
        <li>
          <Link to="/">Главная</Link>
        </li>
        {crumbs.length > 0 &&
          crumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <li className="slash">/</li>
              {index === crumbs.length - 1 ? (
                <li>{crumb.label}</li>
              ) : (
                <li>
                  <Link to={crumb.path || "#"}>{crumb.label}</Link>
                </li>
              )}
            </React.Fragment>
          ))}
      </ul>
    </Container>
  );
};
