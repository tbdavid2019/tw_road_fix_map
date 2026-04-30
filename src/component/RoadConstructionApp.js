import React, { useState, useEffect, useCallback, useMemo } from "react";
import Map from "./Map";
import InfoBlock from "./InfoBlock";
import Card from "./Card";
import InfoButton from "./InfoButton";
import MakerMessage from "./MakerMessage";
import { cityConfig } from "../constants/cityConfig";
import { BottomSheet } from "react-spring-bottom-sheet";

const shouldDebug = process.env.REACT_APP_DEBUG_ROAD_DATA === 'true';
const debugLog = (...args) => {
  if (shouldDebug) {
    console.log(...args);
  }
};

const RoadConstructionApp = () => {
  const [isMobile, setIsMobile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [closeInfoBlock, setCloseInfoBlock] = useState(null);
  const [makerMessage, setMakerMessage] = useState(null);
  const [constructionsData, setConstructionsData] = useState("loading");
  const [bottomSheetOpen, setBottomSheetOpen] = useState(true);
  const [condition, setCondition] = useState({
    workingState: "是",
    distriction: 0,
    date: { start: null, end: null },
    stack: ["workingState"],
  });
  const [mapParameters, setMapParameters] = useState({
    center: { lat: 25.0330, lng: 121.5654 }, // Default to Taipei
    polygon: null,
    zoom: 12,
    selectMarker: null,
    closeInfoWindow: null,
  });

  const INITAIL = useCallback(() => {
    let bool = null;
    changeInfoWindowHeight();
    bool = isWidthUnder(768);
    window.addEventListener("resize", changeInfoWindowHeight);
    window.addEventListener("resize", () => isWidthUnder(768));
    findUserLocation();
    initialInfoBlockDisplay(bool);
  }, []);

  const findUserLocation = () => {
    const handleUserLocation = (position) => {
      let _mapParameters = {
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        polygon: null,
        zoom: 12,
        selectMarker: null,
        closeInfoWindow: null,
      };
      setMapParameters(_mapParameters);
      setUserLocation(_mapParameters.center);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        handleUserLocation(position);
      });
    } else {
      console.log("geolocation is not available");
    }
  };

  const initialInfoBlockDisplay = (bool) => {
    if (bool === false) {
      setCloseInfoBlock(false);
    }
  };

  const changeInfoWindowHeight = () => {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight / 100}px`
    );
  };

  const isWidthUnder = (width) => {
    let bool = null;
    if (window.innerWidth <= width) bool = true;
    else bool = false;
    setIsMobile(bool);
    return bool;
  };

  const convertDate2Num = (date) => {
    let [year, month, day] = Object.values(date);
    year = year.toString();
    month = month.toString();
    day = day.toString();

    if (month.length === 1) month = "0" + month;
    if (day.length === 1) day = "0" + day;

    return parseInt(year + month + day, 10);
  };

  const sliceData = (data) => {
    let _data = data;
    let newData = [];
    for (let i = 0; i < _data.length; i += 10) {
      newData.push(_data.slice(i, i + 10));
    }
    return newData;
  };

  const fetchData = useCallback(async () => {
    debugLog('🚀 開始抓取資料...');
    setConstructionsData("loading");

    const activeCities = Object.values(cityConfig).filter(city => !city.isDisabled);
    debugLog('📍 啟用的城市:', activeCities.map(c => c.name));

    const fetchPromises = activeCities.map(async (city) => {
      try {
        debugLog(`📡 正在抓取 ${city.name} 的資料...`, city.apiUrl);
        const rawData = await city.fetcher(city.apiUrl);
        debugLog(`✅ ${city.name} 原始資料:`, rawData);
        
        let parsedData;
        // Taipei data is nested under 'features'
        if (city.name === '台北市') {
          debugLog(`🏙️ 台北市 features 數量:`, rawData?.features?.length || 0);
          if (rawData && rawData.features && Array.isArray(rawData.features)) {
            parsedData = rawData.features.map(city.parser);
          } else {
            debugLog('⚠️ 台北市資料格式異常，跳過解析');
            parsedData = [];
          }
        }
        // The parser for Kaohsiung expects the full rawData
        else if (city.name === '高雄市') {
          debugLog(`🏭 高雄市 Data 數量:`, rawData?.Data?.length || 0);
          parsedData = city.parser(rawData);
        }
        // Taichung data is a direct array
        else if (city.name === '台中市') {
          debugLog(`🏘️ 台中市資料長度:`, rawData?.length || 0);
          if (Array.isArray(rawData)) {
            parsedData = rawData.map(city.parser);
            debugLog(`✨ 台中市解析後資料數量:`, parsedData.length);
          } else {
            debugLog('⚠️ 台中市資料格式異常，跳過解析');
            parsedData = [];
          }
        }
        // For other cities, map through the array
        else {
          debugLog(`🏘️ ${city.name} 資料長度:`, rawData?.length || 0);
          if (Array.isArray(rawData)) {
            parsedData = rawData.map(city.parser);
          } else {
            parsedData = [];
          }
        }
        
        debugLog(`✨ ${city.name} 解析後資料:`, parsedData);
        return parsedData;
      } catch (error) {
        console.error(`❌ ${city.name} 抓取失敗:`, error);
        return []; // Return empty array on failure
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    debugLog('🎯 Promise.allSettled 結果:', results);

    let allData = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    // 重新排序資料，讓台北市的資料在前面
    allData.sort((a, b) => {
      if (a.city === '台北市' && b.city !== '台北市') return -1;
      if (a.city !== '台北市' && b.city === '台北市') return 1;
      if (a.city === '台中市' && b.city === '高雄市') return -1;
      if (a.city === '高雄市' && b.city === '台中市') return 1;
      return 0;
    });

    debugLog('📊 合併後的所有資料:', allData);
    debugLog('📈 總資料筆數:', allData.length);
    debugLog('🏙️ 資料城市分佈:', allData.reduce((acc, item) => {
      acc[item.city] = (acc[item.city] || 0) + 1;
      return acc;
    }, {}));

    if (allData.length === 0) {
      debugLog('⚠️ 沒有資料，設定為 null');
        setConstructionsData(null); // Set to null if all fetches failed
    } else {
      debugLog('🎉 設定資料完成');
        setConstructionsData(allData);
    }
  }, []);

  useEffect(() => {
    INITAIL();
    fetchData();
  }, [INITAIL, fetchData]);

  const filteredData = useMemo(() => {
    const filteringData = (condition) => {
      let data = constructionsData;
      let newData = [];
      if (data === null || data === "loading") {
        newData = data;
      } else if (condition.stack.length === 3) {
        newData = data.filter(
          (object) =>
            ((convertDate2Num(condition.date.start) >=
              convertDate2Num(object.date.start) &&
              convertDate2Num(condition.date.start) <=
                convertDate2Num(object.date.end)) ||
              (convertDate2Num(condition.date.end) >=
                convertDate2Num(object.date.start) &&
                convertDate2Num(condition.date.end) <=
                  convertDate2Num(object.date.end))) &&
            object.workingState === condition.workingState &&
            object.distriction === condition.distriction
        );
      } else if (condition.stack.length === 2) {
        if (condition.stack.indexOf("date") !== -1) {
          let anotherCondition =
            condition.stack[1 - condition.stack.indexOf("date")];
          newData = data.filter(
            (object) =>
              ((convertDate2Num(condition.date.start) >=
                convertDate2Num(object.date.start) &&
                convertDate2Num(condition.date.start) <=
                  convertDate2Num(object.date.end)) ||
                (convertDate2Num(condition.date.end) >=
                  convertDate2Num(object.date.start) &&
                  convertDate2Num(condition.date.end) <=
                    convertDate2Num(object.date.end))) &&
              object[anotherCondition] === condition[anotherCondition]
          );
        } else {
          newData = data.filter(
            (object) =>
              object.workingState === condition.workingState &&
              object.distriction === condition.distriction
          );
        }
      } else if (condition.stack.length === 1) {
        if (condition.distriction !== 0) {
          newData = data.filter(
            (object) => object.distriction === condition.distriction
          );
        } else if (
          condition.date.start !== null &&
          condition.date.end !== null
        ) {
          newData = data.filter(
            (object) =>
              (convertDate2Num(condition.date.start) >=
                convertDate2Num(object.date.start) &&
                convertDate2Num(condition.date.start) <=
                  convertDate2Num(object.date.end)) ||
              (convertDate2Num(condition.date.end) >=
                convertDate2Num(object.date.start) &&
                convertDate2Num(condition.date.end) <=
                  convertDate2Num(object.date.end))
          );
        } else if (condition.workingState !== 0) {
          newData = data.filter(
            (object) => object.workingState === condition.workingState
          );
        }
      }

      return newData;
    };

    let newData = filteringData(condition);
    return newData;
  }, [condition, constructionsData]);

  const selectorsOptions = useMemo(() => {
    let _stack = condition.stack;
    let _options = {
      workingState: [],
      distriction: [],
      date: { start: {}, end: {} },
    };
    if (
      _stack.length >= 0 &&
      constructionsData !== "loading" &&
      constructionsData !== null
    ) {
      _options.date.start = { ...constructionsData[0].date.start };
      _options.date.end = { ...constructionsData[0].date.end };
      for (let object of constructionsData) {
        if (_options.workingState.indexOf(object.workingState) === -1)
          _options.workingState.push(object.workingState);
        if (_options.distriction.indexOf(object.distriction) === -1)
          _options.distriction.push(object.distriction);
        if (
          convertDate2Num(object.date.start) <=
          convertDate2Num(_options.date.start)
        )
          _options.date.start = { ...object.date.start };
        if (
          convertDate2Num(object.date.end) >= convertDate2Num(_options.date.end)
        )
          _options.date.end = { ...object.date.end };
      }
    }
    return _options;
  }, [condition.stack, constructionsData]);

  const handleCloseClick = () => {
    let _closeInfoBlock = closeInfoBlock;
    if (_closeInfoBlock !== null) {
      _closeInfoBlock = !_closeInfoBlock;
    } else _closeInfoBlock = false;
    setCloseInfoBlock(_closeInfoBlock);
  };

  const handleMakerMessageClick = () => {
    let _makerMessage = makerMessage;
    if (makerMessage !== null) {
      _makerMessage = !_makerMessage;
    } else _makerMessage = true;
    setMakerMessage(_makerMessage);
  };

  if (constructionsData === "loading") {
    return (
      <div className="container">
        <Map
          constructionsData={null}
          mapParameters={mapParameters}
          setMapParameters={setMapParameters}
          closeInfoBlock={closeInfoBlock}
          makerMessage={makerMessage}
          isMobile={isMobile}
          userLocation={userLocation}
        />
        <InfoButton
          closeInfoBlock={closeInfoBlock}
          makerMessage={makerMessage}
          handleCloseClick={handleCloseClick}
          handleMakerMessageClick={handleMakerMessageClick}
          userLocation={userLocation}
          mapParameters={mapParameters}
          setMapParameters={setMapParameters}
        />
        {isMobile ? (
  <BottomSheet
    open={true}
    blocking={false}
    snapPoints={({ maxHeight }) => [160, maxHeight * 0.5]}
    defaultSnap={({ maxHeight }) => maxHeight * 0.5}
  >
    <InfoBlock value="loading" length={0} option={selectorsOptions} condition={condition} mapParameters={mapParameters} closeInfoBlock={closeInfoBlock} isMobile={isMobile} isInBottomSheet={true} handleCloseClick={handleCloseClick} setCondition={setCondition} setMapParameters={setMapParameters} isLoading={true} constructionsData={null} />
  </BottomSheet>
) : (
  <InfoBlock value="loading" length={0} option={selectorsOptions} condition={condition} mapParameters={mapParameters} closeInfoBlock={closeInfoBlock} isMobile={isMobile} handleCloseClick={handleCloseClick} setCondition={setCondition} setMapParameters={setMapParameters} isLoading={true} constructionsData={null} />
)}
        <MakerMessage
          makerMessage={makerMessage}
          handleMakerMessageClick={handleMakerMessageClick}
        />
      </div>
    );
  } else if (constructionsData === null) {
    return (
      <div className="container">
        <Map
          constructionsData={null}
          mapParameters={mapParameters}
          setMapParameters={setMapParameters}
          closeInfoBlock={closeInfoBlock}
          makerMessage={makerMessage}
          isMobile={isMobile}
          userLocation={userLocation}
        />
        <InfoButton
          closeInfoBlock={closeInfoBlock}
          makerMessage={makerMessage}
          handleCloseClick={handleCloseClick}
          handleMakerMessageClick={handleMakerMessageClick}
          userLocation={userLocation}
          mapParameters={mapParameters}
          setMapParameters={setMapParameters}
        />
        {isMobile ? (
  <BottomSheet
    open={true}
    blocking={false}
    snapPoints={({ maxHeight }) => [160, maxHeight * 0.5]}
    defaultSnap={({ maxHeight }) => maxHeight * 0.5}
  >
    <InfoBlock value={null} length={0} option={selectorsOptions} condition={condition} mapParameters={mapParameters} closeInfoBlock={closeInfoBlock} isMobile={isMobile} isInBottomSheet={true} handleCloseClick={handleCloseClick} setCondition={setCondition} setMapParameters={setMapParameters} isLoading={false} constructionsData={null} />
  </BottomSheet>
) : (
  <InfoBlock value={null} length={0} option={selectorsOptions} condition={condition} mapParameters={mapParameters} closeInfoBlock={closeInfoBlock} isMobile={isMobile} handleCloseClick={handleCloseClick} setCondition={setCondition} setMapParameters={setMapParameters} isLoading={false} constructionsData={null} />
)}
        <MakerMessage
          makerMessage={makerMessage}
          handleMakerMessageClick={handleMakerMessageClick}
        />
      </div>
    );
  } else {
    let data = null;
    if (
      condition.distriction === 0 &&
      condition.date.start === null &&
      condition.date.end === null &&
      condition.workingState === 0
    ) {
      data = constructionsData;
    } else {
      data = filteredData;
    }
    return (
      <div className="container">
        <Map
          constructionsData={sliceData(data)}
          mapParameters={mapParameters}
          closeInfoBlock={closeInfoBlock}
          setMapParameters={setMapParameters}
          makerMessage={makerMessage}
          isMobile={isMobile}
          userLocation={userLocation}
        />
        <InfoButton
          closeInfoBlock={closeInfoBlock}
          makerMessage={makerMessage}
          handleCloseClick={handleCloseClick}
          handleMakerMessageClick={handleMakerMessageClick}
          userLocation={userLocation}
          mapParameters={mapParameters}
          setMapParameters={setMapParameters}
        />
        {isMobile ? (

          <BottomSheet

            open={true}

            blocking={false}

            snapPoints={({ maxHeight }) => [120, maxHeight * 0.5, maxHeight * 0.95]}

            defaultSnap={({ maxHeight }) => 120}

            expandOnContentDrag={true}

          >

            {(mapParameters.selectMarker && !mapParameters.closeInfoWindow) ? (
              <div style={{ padding: '0 15px 15px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>施工詳情</h3>
                  <button 
                    onClick={() => setMapParameters({...mapParameters, selectMarker: null, closeInfoWindow: true})}
                    style={{ background: 'none', border: 'none', fontSize: '24px', color: '#999', cursor: 'pointer', padding: '0 10px' }}
                  >
                    ×
                  </button>
                </div>
                <Card value={mapParameters.selectMarker} setMapParameters={setMapParameters} />
              </div>
            ) : (
              <InfoBlock
                value={sliceData(data)}
                length={data.length}
                option={selectorsOptions}
                condition={condition}
                mapParameters={mapParameters}
                closeInfoBlock={closeInfoBlock}
                isMobile={isMobile}
                isInBottomSheet={true}
                handleCloseClick={handleCloseClick}
                setCondition={setCondition}
                setMapParameters={setMapParameters}
                constructionsData={constructionsData}
              />
            )}

          </BottomSheet>

        ) : (

          <InfoBlock
              value={sliceData(data)}
              length={data.length}
              option={selectorsOptions}
              condition={condition}
              mapParameters={mapParameters}
              closeInfoBlock={closeInfoBlock}
              isMobile={isMobile}
              handleCloseClick={handleCloseClick}
              setCondition={setCondition}
              setMapParameters={setMapParameters}
              constructionsData={constructionsData}

          />

        )}
        <MakerMessage
          makerMessage={makerMessage}
          handleMakerMessageClick={handleMakerMessageClick}
        />
      </div>
    );
  }
};

export default RoadConstructionApp;
