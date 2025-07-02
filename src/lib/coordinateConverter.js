import proj4 from 'proj4';

// Define the TWD97 and WGS84 coordinate systems
proj4.defs('TWD97', '+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('WGS84', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');

/**
 * Converts TWD97 coordinates to WGS84 (latitude and longitude).
 * @param {number} x - The TWD97 X coordinate.
 * @param {number} y - The TWD97 Y coordinate.
 * @returns {{lat: number, lng: number}} The converted WGS84 coordinates.
 */
export const convertTWD97ToWGS84 = (x, y) => {
  if (typeof x !== 'number' || typeof y !== 'number') {
    console.error('Invalid coordinates for conversion');
    return { lat: 0, lng: 0 };
  }
  const [lng, lat] = proj4('TWD97', 'WGS84', [x, y]);
  return { lat, lng };
};
