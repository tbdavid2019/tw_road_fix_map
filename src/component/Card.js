import { useState } from "react";

const Card = (props) => {
  let data = props.value;

  const [showLess, setShowLess] = useState(true);
  const { setMapParameters } = props;
  const handleClick = () => {
    setShowLess(!showLess);
  };

  const handleLocationData = () => {
    let randomNum = Math.random() / 1000000;
    setMapParameters({
      center: {
        lat: data.coordinate.lat + randomNum,
        lng: data.coordinate.lng + randomNum,
      },
      polygon: data.coordinate.polygon,
      zoom: 20 + randomNum,
      selectMarker: data,
      closeInfoWindow: false,
    });
  };

  if (data === "loading") {
    return (
      <div className="card loading">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-meta">
        <div className="card-meta-title">
          <div
            className="highlighter bgColor_mintGreen-light"
            style={{ width: data.pipeType.length + "em" }}
          ></div>
          <div
            className={`state unselectable ${
              data.workingState === "是" ? "working" : "notWorking"
            }`}
          >
            {data.workingState === "是" ? "施工中" : "未施工"}
          </div>
          <div className="pipeType" style={{ position: "relative" }}>
            {data.pipeType}
          </div>
        </div>
        <div className="card-meta-basicInfo">
          <div className="date">
            <span className="slash">{data.date.start.year}</span>
            <span className="slash">{data.date.start.month}</span>
            <span>{data.date.start.day}</span>
            <i className="fas fa-caret-right fa-lg"></i>
            <span className="slash">{data.date.end.year}</span>
            <span className="slash">{data.date.end.month}</span>
            <span>{data.date.end.day}</span>
          </div>
          <div className="info">
            <div className="item">案件類別</div>
            <div>{data.constructionType}</div>
          </div>
          <div className="info">
            <div className="item">地點</div>
            <div>{data.distriction + data.address}</div>
          </div>
        </div>
        <div className="card-action-row" style={{display:'flex',gap:'28px',justifyContent:'flex-end',margin:'0'}}>
          {data.coordinate.lat !== 0 && data.coordinate.lat !== 0 && (
            <div className="card-action-btn" onClick={handleLocationData} style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer'}}>
              <div className="card-action-circle" style={{background:'#17909c',width:'60px',height:'60px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'8px',boxShadow:'0 2px 8px #e0e0e0'}}>
                <img src={process.env.PUBLIC_URL + "/position.png"} alt="定位" style={{width:'28px',height:'28px'}} />
              </div>
              <span className="card-action-label" style={{color:'#17909c',fontSize:'15px',fontWeight:500,letterSpacing:'2px'}}></span>
            </div>
          )}
          <div className="card-action-btn" onClick={handleClick} style={{display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer'}}>
            <div className="card-action-circle" style={{background:'#17909c',width:'60px',height:'60px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'8px',boxShadow:'0 2px 8px #e0e0e0'}}>
              <img src={process.env.PUBLIC_URL + "/information.png"} alt="更多資訊" style={{width:'28px',height:'28px'}} />
            </div>
            <span className="card-action-label" style={{color:'#17909c',fontSize:'15px',fontWeight:500,letterSpacing:'2px'}}></span>
          </div>
        </div>
      </div>
      <div className={`${showLess && "noneDisplay"} horiLine`} />
      <div className={`${showLess && "noneDisplay"} card-body`}>
        <div className="card-body-detailInfo">
          <div className="oneRow">
            <div className="item">工程名稱</div>
            <div className="constructTitle">{data.title}</div>
          </div>
          <div>
            <div className="item">申請書編號</div>
            <div>{data.applicationNumber}</div>
          </div>
          <div>
            <div className="item">許可證編號</div>
            <div>{data.licenseNumber}</div>
          </div>
          <div className="oneRow">
            <div className="item">申請單位</div>
            <div>{data.applicant}</div>
          </div>
          <div className="oneRow">
            <div className="item">廠商</div>
            <div>{data.contractor.name}</div>
            <div className="phone">{data.contractor.phone}</div>
          </div>
          <div className="oneRow">
            <div className="item">負責人</div>
            <div>{data.personInCharge.name}</div>
            <div className="phone">{data.personInCharge.phone}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
