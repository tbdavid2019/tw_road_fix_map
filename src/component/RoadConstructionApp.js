import React, { useState, useEffect, useCallback, useMemo } from "react";
import Map from "./Map";
import InfoBlock from "./InfoBlock";
import InfoButton from "./InfoButton";
import MakerMessage from "./MakerMessage";
import { cityConfig } from "../constants/cityConfig";

const RoadConstructionApp = () => {
  const [isMobile, setIsMobile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [closeInfoBlock, setCloseInfoBlock] = useState(null);
  const [makerMessage, setMakerMessage] = useState(null);
  const [constructionsData, setConstructionsData] = useState("loading");
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
    bool = isWidthUnder(428);
    window.addEventListener("resize", changeInfoWindowHeight);
    window.addEventListener("resize", () => isWidthUnder(428));
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
    console.log('🚀 開始抓取資料...');
    setConstructionsData("loading");

    const activeCities = Object.values(cityConfig).filter(city => !city.isDisabled);
    console.log('📍 啟用的城市:', activeCities.map(c => c.name));

    const fetchPromises = activeCities.map(async (city) => {
      try {
        console.log(`📡 正在抓取 ${city.name} 的資料...`, city.apiUrl);
        const rawData = await city.fetcher(city.apiUrl);
        console.log(`✅ ${city.name} 原始資料:`, rawData);
        
        let parsedData;
        // Taipei data is nested under 'features'
        if (city.name === '台北市') {
          console.log(`🏙️ 台北市 features 數量:`, rawData?.features?.length || 0);
          if (rawData && rawData.features && Array.isArray(rawData.features)) {
            parsedData = rawData.features.map(city.parser);
          } else {
            console.log('⚠️ 台北市資料格式異常，跳過解析');
            parsedData = [];
          }
        }
        // The parser for Kaohsiung expects the full rawData
        else if (city.name === '高雄市') {
          console.log(`🏭 高雄市 Data 數量:`, rawData?.Data?.length || 0);
          parsedData = city.parser(rawData);
        }
        // Taichung data is a direct array
        else if (city.name === '台中市') {
          console.log(`🏘️ 台中市資料長度:`, rawData?.length || 0);
          if (Array.isArray(rawData)) {
            parsedData = rawData.map(city.parser);
            console.log(`✨ 台中市解析後資料數量:`, parsedData.length);
          } else {
            console.log('⚠️ 台中市資料格式異常，跳過解析');
            parsedData = [];
          }
        }
        // For other cities, map through the array
        else {
          console.log(`🏘️ ${city.name} 資料長度:`, rawData?.length || 0);
          if (Array.isArray(rawData)) {
            parsedData = rawData.map(city.parser);
          } else {
            parsedData = [];
          }
        }
        
        console.log(`✨ ${city.name} 解析後資料:`, parsedData);
        return parsedData;
      } catch (error) {
        console.error(`❌ ${city.name} 抓取失敗:`, error);
        return []; // Return empty array on failure
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    console.log('🎯 Promise.allSettled 結果:', results);

    const allData = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    console.log('📊 合併後的所有資料:', allData);
    console.log('📈 總資料筆數:', allData.length);

    if (allData.length === 0) {
        console.log('⚠️ 沒有資料，設定為 null');
        setConstructionsData(null); // Set to null if all fetches failed
    } else {
        console.log('🎉 設定資料完成');
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

  if (constructionsData === "loading" || constructionsData === null) {
    return (
      <div>
        <Map
          constructionsData={null}
          mapParameters={mapParameters}
          setMapParameters={setMapParameters}
        />
        <InfoBlock value={constructionsData} />
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
        />
        <MakerMessage
          makerMessage={makerMessage}
          handleMakerMessageClick={handleMakerMessageClick}
        />
      </div>
    );
  }
};

export default RoadConstructionApp;
