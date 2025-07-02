async function fetchApiData(url) {
  const res = await fetch(url, {
    method: "GET",
  });
  if (res.status !== 200 || !res.ok) {
    throw new Error(
      `[fetchAPIData] Error fetching data: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

export default fetchApiData;
