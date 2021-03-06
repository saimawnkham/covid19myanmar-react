import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useLocalStorage} from 'react-use';
import axios from 'axios';

import {MAP_META} from '../constants';
import {
  formatDate,
  formatDateAbsolute,
  preprocessTimeseries,
  parseStateTimeseries,
} from '../utils/common-functions';
import * as Icon from 'react-feather';
import {useTranslation} from 'react-i18next';

import Table from './table';
import Level from './level';
import MapExplorer from './mapexplorer';
import TimeSeries from './timeseries';
import Minigraph from './minigraph';
import Updates from './updates';
import Footer from './footer';

function Home(props) {
  const {t} = useTranslation();

  const [states, setStates] = useState([]);
  const [stateDistrictWiseData, setStateDistrictWiseData] = useState({});
  const [fetched, setFetched] = useState(false);
  const [graphOption, setGraphOption] = useState(1);
  const [lastUpdated, setLastUpdated] = useState('');
  const [timeseries, setTimeseries] = useState({});
  const [activeStateCode, setActiveStateCode] = useState('TT'); // TT -> India
  const [regionHighlighted, setRegionHighlighted] = useState(undefined);
  const [showUpdates, setShowUpdates] = useState(false);
  const [seenUpdates, setSeenUpdates] = useState(false);
  const [newUpdate, setNewUpdate] = useState(true);
  const [timeseriesMode, setTimeseriesMode] = useLocalStorage(
    'timeseriesMode',
    true
  );
  const [timeseriesLogMode, setTimeseriesLogMode] = useLocalStorage(
    'timeseriesLogMode',
    false
  );

  useEffect(() => {
    // this if block is for checking if user opened a page for first time.
    if (localStorage.getItem('anyNewUpdate') === null) {
      localStorage.setItem('anyNewUpdate', true);
    } else {
      setSeenUpdates(true);
      setNewUpdate(localStorage.getItem('anyNewUpdate') === 'false');
    }
    if (fetched === false) {
      getStates();
      axios
        .get('https://raw.githubusercontent.com/thantthet/covid19-api/master/updatelog/log.json')
        .then((response) => {
          const currentTimestamp = response.data
            .slice()
            .reverse()[0]
            .timestamp.toString();
          // Sets and Updates the data in the local storage.
          if (localStorage.getItem('currentItem') !== null) {
            if (localStorage.getItem('currentItem') !== currentTimestamp) {
              localStorage.setItem('currentItem', currentTimestamp);
              localStorage.setItem('anyNewUpdate', true);
            }
          } else {
            localStorage.setItem('currentItem', currentTimestamp);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [fetched]);

  const getStates = async () => {
    try {
      const [
        {data},
        stateDistrictWiseResponse,
        {data: statesDailyResponse},
      ] = await Promise.all([
        axios.get('https://raw.githubusercontent.com/thantthet/covid19-api/master/data.json'),
        axios.get('https://raw.githubusercontent.com/thantthet/covid19-api/master/state_district_wise.json'),
        axios.get('https://raw.githubusercontent.com/thantthet/covid19-api/master/states_daily.json'),
      ]);
      setStates(data.statewise);
      const ts = parseStateTimeseries(statesDailyResponse);
      ts['TT'] = preprocessTimeseries(data.cases_time_series); // TT -> India
      setTimeseries(ts);
      setLastUpdated(data.statewise[0].lastupdatedtime);
      setStateDistrictWiseData(stateDistrictWiseResponse.data);
      setFetched(true);
    } catch (err) {
      console.log(err);
    }
  };

  const onHighlightState = (state, index) => {
    if (!state && !index) return setRegionHighlighted(null);
    setRegionHighlighted({state, index});
  };
  const onHighlightDistrict = (district, state, index) => {
    if (!state && !index && !district) return setRegionHighlighted(null);
    setRegionHighlighted({district, state, index});
  };

  const onMapHighlightChange = useCallback(({statecode}) => {
    setActiveStateCode(statecode);
  }, []);

  const refs = [useRef(), useRef(), useRef()];
  // const scrollHandlers = refs.map((ref) => () =>
  //   window.scrollTo({
  //     top: ref.current.offsetTop,
  //     behavior: 'smooth',
  //   })
  // );

  return (
    <React.Fragment>
      <div className="Home">
        <div className="home-left">
          <div className="header fadeInUp" style={{animationDelay: '1s'}}>
            <div className="actions">
              <h5>
                {isNaN(Date.parse(formatDate(lastUpdated)))
                  ? ''
                  : formatDateAbsolute(lastUpdated)}
              </h5>
              {!showUpdates && (
                <div className="bell-icon">
                  <Icon.Bell
                    onClick={() => {
                      setShowUpdates(!showUpdates);
                      localStorage.setItem('anyNewUpdate', false);
                      setSeenUpdates(true);
                      setNewUpdate(
                        localStorage.getItem('anyNewUpdate') === 'false'
                      );
                    }}
                  />
                  {seenUpdates ? (
                    !newUpdate ? (
                      <div className="indicator"></div>
                    ) : (
                      ''
                    )
                  ) : (
                    <div className="indicator"></div>
                  )}
                </div>
              )}
              {showUpdates && (
                <Icon.BellOff
                  onClick={() => {
                    setShowUpdates(!showUpdates);
                  }}
                />
              )}
            </div>
          </div>

          {showUpdates && <Updates />}

          {states.length ? <Level data={states[0]} /> : ''}
          {fetched && <Minigraph timeseries={timeseries['TT']} />}
          {fetched && (
            <Table
              forwardRef={refs[0]}
              states={states}
              summary={false}
              stateDistrictWiseData={stateDistrictWiseData}
              onHighlightState={onHighlightState}
              onHighlightDistrict={onHighlightDistrict}
            />
          )}
        </div>

        <div className="home-right">
          {fetched && (
            <React.Fragment>
              <MapExplorer
                forwardRef={refs[1]}
                mapMeta={MAP_META.Myanmar}
                states={states}
                stateDistrictWiseData={stateDistrictWiseData}
                // stateTestData={stateTestData}
                regionHighlighted={regionHighlighted}
                onMapHighlightChange={onMapHighlightChange}
                isCountryLoaded={true}
              />

              <div
                className="timeseries-header fadeInUp"
                style={{animationDelay: '2.5s'}}
                ref={refs[2]}
              >
                <h1>{t("Spread Trends")}</h1>
                <div className="tabs">
                  <div
                    className={`tab ${graphOption === 1 ? 'focused' : ''}`}
                    onClick={() => {
                      setGraphOption(1);
                    }}
                  >
                    <h4>{t("Cumulative")}</h4>
                  </div>
                  <div
                    className={`tab ${graphOption === 2 ? 'focused' : ''}`}
                    onClick={() => {
                      setGraphOption(2);
                    }}
                  >
                    <h4>{t("Daily")}</h4>
                  </div>
                </div>

                <div className="scale-modes">
                  <label className="main">{t("Scale Modes")}</label>
                  <div className="timeseries-mode">
                    <label htmlFor="timeseries-mode">{t("chart.mode.uniform")}</label>
                    <input
                      id="timeseries-mode"
                      type="checkbox"
                      checked={timeseriesMode}
                      className="switch"
                      aria-label="Checked by default to scale uniformly."
                      onChange={(event) => {
                        setTimeseriesMode(!timeseriesMode);
                      }}
                    />
                  </div>
                  <div
                    className={`timeseries-logmode ${
                      graphOption !== 1 ? 'disabled' : ''
                    }`}
                  >
                    <label htmlFor="timeseries-logmode">{t("chart.mode.logarithmic")}</label>
                    <input
                      id="timeseries-logmode"
                      type="checkbox"
                      checked={graphOption === 1 && timeseriesLogMode}
                      className="switch"
                      disabled={graphOption !== 1}
                      onChange={(event) => {
                        setTimeseriesLogMode(!timeseriesLogMode);
                      }}
                    />
                  </div>
                </div>

                <div className="trends-state-name">
                  <select
                    onChange={({target}) => {
                      onHighlightState(JSON.parse(target.value));
                    }}
                  >
                    {states.map((s) => {
                      return (
                        <option
                          key={s.statecode}
                          value={JSON.stringify(s)}
                          selected={s.statecode === activeStateCode}
                        >
                          {s.state === 'Total' ? t('All States') : t(`statenames.${s.state.toLowerCase()}`)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <TimeSeries
                timeseries={timeseries[activeStateCode]}
                type={graphOption}
                mode={timeseriesMode}
                logMode={timeseriesLogMode}
              />
            </React.Fragment>
          )}
        </div>
      </div>
      <Footer />
    </React.Fragment>
  );
}

export default Home;
