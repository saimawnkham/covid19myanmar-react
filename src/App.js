import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import {AnimatedSwitch} from 'react-router-transition';
import {useTranslation} from 'react-i18next';

import './App.scss';

import Home from './components/home';
import Navbar from './components/navbar';
import PatientDB from './components/patientdb';
import DeepDive from './components/deepdive';
import State from './components/state';

function App() {
  const {t} = useTranslation();

  const pages = [
    {
      pageLink: '/',
      view: Home,
      displayName: t('menu.home'),
      animationDelayForNavbar: 0.2,
      showInNavbar: true,
    },
    {
      pageLink: '/demographics',
      view: PatientDB,
      displayName: t('menu.demographics'),
      animationDelayForNavbar: 0.3,
      showInNavbar: true,
    },
    {
      pageLink: '/deepdive',
      view: DeepDive,
      displayName: t('menu.deepdrive'),
      animationDelayForNavbar: 0.4,
      showInNavbar: true,
    },
    {
      pageLink: '/state/:stateCode',
      view: State,
      displayName: t('menu.state'),
      animationDelayForNavbar: 0.8,
      showInNavbar: false,
    },
  ];

  return (
    <div className="App">
      <Route
        render={({location}) => (
          <div className="Almighty-Router">
            <Navbar pages={pages} />
            <Route exact path="/" render={() => <Redirect to="/" />} />
            <AnimatedSwitch
              atEnter={{opacity: 0}}
              atLeave={{opacity: 0}}
              atActive={{opacity: 5}}
              className="switch-wrapper"
              location={location}
            >
              {pages.map((page, i) => {
                return (
                  <Route
                    exact
                    path={page.pageLink}
                    component={page.view}
                    key={i}
                  />
                );
              })}
              <Redirect to="/" />
            </AnimatedSwitch>
          </div>
        )}
      />
    </div>
  );
}

export default App;
