import React from 'react';
import * as Icon from 'react-feather';
import Popup from './popup';

function Footer(props) {
  return (
    <footer className="fadeInUp" style={{animationDelay: '2s'}}>
      <h5>We stand with everyone fighting on the frontlines</h5>
      <a
        href="https://github.com/thantthet/covid19myanmar-react"
        className="button github"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon.GitHub />
        <span>A fork of covid19india.org</span>
      </a>
      <a
        className="button excel"
        href="http://covidmyanmar.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon.Database />
        <span>dataset by covidmyanmar.com</span>
      </a>
      <Popup />
    </footer>
  );
}

export default Footer;
