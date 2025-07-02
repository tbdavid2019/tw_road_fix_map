import React, { useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  InfoWindow,
  MarkerClusterer,
  Marker,
  Polygon,
} from "@react-google-maps/api";
import CardMini from "./CardMini";

const Map = (props) => {
  const [gridSize, setGridSize] = useState(60);
  const {
    constructionsData,
    mapParameters,
    closeInfoBlock,
    setMapParameters,
    isMobile,
    makerMessage,
    userLocation,
  } = props;
  const mapRef = useRef(null);
  let isClusterWork =
    constructionsData !== null && constructionsData.length !== 0 ? true : false;

  const changeGridSize = () => {
    let size = null;
    if (!mapRef.current || mapRef.current.zoom <= 18) size = 60;
    else if (mapRef.current.zoom > 18) size = 1;
    setGridSize(size);
  };

  const handleMapOnLoad = (map) => {
    mapRef.current = map;
  };

  const handleInfoWindowOnCloseClick = () => {
    setMapParameters({
      center: mapParameters.center,
      polygon: mapParameters.polygon,
      zoom: mapParameters.zoom,
      selectMarker: null,
      closeInfoWindow: true,
    });
  };

  const isInfoWindowShow = () => {
    let bool = false;
    if (mapParameters.closeInfoWindow === true) bool = false;
    else if (mapParameters.selectMarker !== null) bool = true;
    return bool;
  };

  const renderCluster = useMemo(() => {
    const handleMarkerClick = (i) => {
      // center = mapRef.current.center;
      let data = constructionsData[Math.floor(i / 10)][i % 10];
      let newCenter = mapRef.current.getCenter().toJSON();

      setMapParameters({
        center: newCenter,
        polygon: data.coordinate.polygon,
        zoom: mapParameters.zoom,
        selectMarker: data,
        closeInfoWindow: false,
      });
    };

    const renderMarker = (cluster) => {
      let markersNum =
        (constructionsData.length - 1) * 10 +
        constructionsData[constructionsData.length - 1].length;
      let markers = Array.from({ length: markersNum }, (_, index) => index);
      return markers.map(
        (i) =>
          constructionsData[Math.floor(i / 10)][i % 10].coordinate.lat !== 0 &&
          constructionsData[Math.floor(i / 10)][i % 10].coordinate.lng !==
            0 && (
            <Marker
              key={"marker_" + i}
              position={{
                lat: Number(
                  constructionsData[Math.floor(i / 10)][i % 10].coordinate.lat
                ),
                lng: Number(
                  constructionsData[Math.floor(i / 10)][i % 10].coordinate.lng
                ),
              }}
              onClick={() => handleMarkerClick(i)}
              clusterer={cluster}
              noClustererRedraw={true}
              icon={
                constructionsData[Math.floor(i / 10)][i % 10].workingState ===
                "是"
                  ? {
                      url: process.env.PUBLIC_URL + "/img/marker/cone.png",
                      scaledSize: { width: 37, height: 37 },
                    }
                  : {
                      url: process.env.PUBLIC_URL + "/img/marker/cone_gray.png",
                      scaledSize: { width: 37, height: 37 },
                    }
              }
            />
          )
      );
    };

    return (
      isClusterWork && (
        <MarkerClusterer
          key="markerClusterer"
          averageCenter={true}
          options={clustersOptions}
          gridSize={gridSize}
        >
          {(cluster) => renderMarker(cluster)}
        </MarkerClusterer>
      )
    );
  }, [
    constructionsData,
    isClusterWork,
    gridSize,
    mapParameters,
    setMapParameters,
  ]);

  const mapCoverState = () => {
    if (constructionsData === null) return "open";
    else if (isMobile) {
      if (closeInfoBlock === null && makerMessage === null) return "close";
      else if (closeInfoBlock === false || makerMessage === true) return "open";
      else if (closeInfoBlock === true || makerMessage === false)
        return "close";
    } else {
      return "close";
    }
  };

  return (
    <div className="mapContainer">
      <div id="mapCover" className={`mapCover ${mapCoverState()}`} />
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY}>
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "inherit",
          }}
          zoom={mapParameters.zoom}
          center={mapParameters.center}
          // center={{lat : mapParameters.center.lat, lng : mapParameters.center.lng - (window.innerWidth * 0.00000015)}}
          options={{
            styles: mapStyle,
            minZoom: 11,
            maxZoom: 20,
            disableDefaultUI: true,
          }}
          onLoad={(map) => {
            handleMapOnLoad(map);
          }}
          onZoomChanged={changeGridSize}
        >
          {renderCluster}
          {userLocation !== null && (
            <Marker key="userLocation" position={userLocation} zIndex={100} />
          )}
          {isInfoWindowShow() && (
            <InfoWindow
              position={{
                lat: mapParameters.selectMarker.coordinate.lat,
                lng: mapParameters.selectMarker.coordinate.lng,
              }}
              options={{
                pixelOffset: new window.google.maps.Size(0, -45),
              }}
              onCloseClick={handleInfoWindowOnCloseClick}
            >
              <CardMini value={mapParameters.selectMarker} />
            </InfoWindow>
          )}
          {mapParameters.polygon && (
            <Polygon path={mapParameters.polygon} options={polygonOptions} />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

const mapStyle = [
  {
    featureType: "landscape.man_made",
    elementType: "geometry.fill",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry.fill",
    stylers: [
      {
        visibility: "on",
      },
      {
        color: "#f0f0f0",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry.fill",
    stylers: [
      {
        visibility: "on",
      },
      // {
      //     "color": "#88cece"
      // }
    ],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
      {
        color: "#ec7868",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        visibility: "on",
      },
      {
        color: "#3da7a7",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [
      {
        visibility: "on",
      },
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#cccccc",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#f9f9f9",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        visibility: "on",
      },
      {
        lightness: 700,
      },
    ],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [
      {
        color: "#83cfe2",
      },
    ],
  },
];

const polygonOptions = {
  fillColor: "#FF7777",
  fillOpacity: 0.1,
  strokeColor: "#FF7777",
  strokeOpacity: 1,
  strokeWeight: 1,
  clickable: false,
  draggable: false,
  editable: false,
  geodesic: false,
  zIndex: 0,
};

const clustersOptions = {
  styles: [
    {
      textSize: 14,
      height: 66,
      width: 66,
      url: process.env.PUBLIC_URL + "/img/markerclusterer/m1.png",
    },
    {
      textSize: 14,
      height: 66,
      width: 66,
      url: process.env.PUBLIC_URL + "/img/markerclusterer/m2.png",
    },
    {
      height: 66,
      width: 66,
      url: process.env.PUBLIC_URL + "/img/markerclusterer/m3.png",
    },
    {
      height: 66,
      width: 66,
      url: process.env.PUBLIC_URL + "/img/markerclusterer/m4.png",
    },
    {
      height: 66,
      width: 66,
      url: process.env.PUBLIC_URL + "/img/markerclusterer/m5.png",
    },
  ],
};

export default Map;
