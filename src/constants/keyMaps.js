// keyMaps for different cities

export const taichungKeyMap = Object.freeze({
  applicationId: "申請書編號",
  permitId: "許可證編號",
  startDate: "核准起日期", // 核准起日
  endDate: "核准迄日期", // 核准迄日
  applicantUnit: "申請單位",
  projectName: "工程名稱",
  caseType: "案件類別",
  pipeType: "管線工程類別",
  district: "區域名稱",
  location: "地點",
  isStarted: "是否開工",
  contactName: "承辦人",
  contactPhone: "承辦人電話",
  contractorName: "廠商名稱",
  contractorPhone: "廠商電話",
  lng: "經度", // 中心點X坐標
  lat: "緯度", // 中心點Y坐標
  geometry: "施工範圍坐標",
});

export const taipeiKeyMap = Object.freeze({
  projectName: "Addr",
  startDate: "Cb_Da",
  endDate: "Ce_Da",
  district: "C_Name",
  location: "Addr",
  contractorName: "App_Name",
  x: "X",
  y: "Y",
});

export const kaohsiungKeyMap = Object.freeze({
  projectName: "cnstRoad",
  dateRange: "cnstDate",
  contractorName: "contractor",
  contractorPhone: "contractorPhone",
  permitId: "pmtNo",
  lat: "lat",
  lng: "lng",
});
