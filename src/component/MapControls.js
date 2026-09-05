import React, { useState } from "react";

const MapControls = ({
  mapRef,
  userLocation,
  setUserLocation,
  mapParameters,
  setMapParameters,
  isMobile,
}) => {
  const [isLocating, setIsLocating] = useState(false);

  const handleZoomIn = () => {
    if (!mapRef || !mapRef.current) return;
    const currentZoom = mapRef.current.getZoom
      ? mapRef.current.getZoom()
      : mapParameters.zoom;
    if (currentZoom < 20) {
      const nextZoom = currentZoom + 1;
      if (mapRef.current.setZoom) {
        mapRef.current.setZoom(nextZoom);
      }
      setMapParameters((prev) => ({ ...prev, zoom: nextZoom }));
    }
  };

  const handleZoomOut = () => {
    if (!mapRef || !mapRef.current) return;
    const currentZoom = mapRef.current.getZoom
      ? mapRef.current.getZoom()
      : mapParameters.zoom;
    if (currentZoom > 11) {
      const nextZoom = currentZoom - 1;
      if (mapRef.current.setZoom) {
        mapRef.current.setZoom(nextZoom);
      }
      setMapParameters((prev) => ({ ...prev, zoom: nextZoom }));
    }
  };

  const handleLocateMe = () => {
    if (isLocating) return;

    if (!navigator.geolocation) {
      alert("您的瀏覽器不支援地理定位功能。");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (setUserLocation) {
          setUserLocation(coords);
        }

        if (mapRef && mapRef.current) {
          if (mapRef.current.panTo) {
            mapRef.current.panTo(coords);
          }
          const currentZoom = mapRef.current.getZoom
            ? mapRef.current.getZoom()
            : 12;
          const targetZoom = Math.max(currentZoom, 15);
          if (mapRef.current.setZoom) {
            mapRef.current.setZoom(targetZoom);
          }
          setMapParameters((prev) => ({
            ...prev,
            center: coords,
            zoom: targetZoom,
          }));
        } else {
          setMapParameters((prev) => ({
            ...prev,
            center: coords,
            zoom: Math.max(prev.zoom, 15),
          }));
        }

        setIsLocating(false);
      },
      (error) => {
        console.warn("Geolocation failed:", error);
        setIsLocating(false);
        if (userLocation && mapRef && mapRef.current && mapRef.current.panTo) {
          mapRef.current.panTo(userLocation);
          setMapParameters((prev) => ({
            ...prev,
            center: userLocation,
          }));
        } else {
          alert("無法取得您的精確定位，請確認已開啟瀏覽器定位權限。");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  return (
    <div className={`mapFloatingControls ${isMobile ? "mobile" : ""}`}>
      {/* Google Maps 原生風格定位按鈕 */}
      <button
        type="button"
        className={`mapControlBtn locationBtn ${isLocating ? "locating" : ""} ${
          userLocation ? "hasLocation" : ""
        }`}
        onClick={handleLocateMe}
        title="顯示您的目前位置"
        aria-label="顯示您的目前位置"
      >
        <svg
          viewBox="0 0 24 24"
          className={`controlIcon ${isLocating ? "spin" : ""}`}
          width="20"
          height="20"
        >
          <path
            fill="currentColor"
            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
          />
        </svg>
      </button>

      {/* Google Maps 原生風格縮放控制按鈕組 */}
      <div className="zoomControlsGroup">
        <button
          type="button"
          className="mapControlBtn zoomInBtn"
          onClick={handleZoomIn}
          title="放大"
          aria-label="放大地圖"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
        <div className="zoomDivider" />
        <button
          type="button"
          className="mapControlBtn zoomOutBtn"
          onClick={handleZoomOut}
          title="縮小"
          aria-label="縮小地圖"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M19 13H5v-2h14v2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MapControls;
