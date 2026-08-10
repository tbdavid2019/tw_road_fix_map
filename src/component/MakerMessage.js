import CloseButton from "./CloseButton";

const MakerMessage = (props) => {
    let { makerMessage, handleMakerMessageClick } = props;

    const getCSSState = (condition) => {
        let state = '';
        if (condition === null) state = 'hide';
        else if (condition === true) state = 'open';
        else if (condition === false) state = 'close';
        return state;
    };

    const externalCitySources = [
        { name: "臺南市", system: "臺南市道路挖掘管理系統 (DigGIS)", url: "https://diggis.tainan.gov.tw/tnroad/", status: "官方系統" },
        { name: "新竹市", system: "新竹市道路挖掘資訊統計 / 政府開放資料", url: "https://data.gov.tw/dataset/131133", status: "統計資料" },
        { name: "彰化縣", system: "彰化縣政府管線挖掘便民服務系統", url: "https://pipegis.chcg.gov.tw/CHCGPub/", status: "已整合地圖" },
        { name: "基隆市", system: "基隆市道路管理資訊平台", url: "https://kct.klcg.gov.tw/klroad/", status: "已整合地圖" },
        { name: "新北市", system: "新北市政府道路挖掘即時施工資訊", url: "https://data.ntpc.gov.tw/", status: "Open Data" },
        { name: "桃園市", system: "桃園市道路挖掘資訊網", url: "https://data.tycg.gov.tw/", status: "Open Data" },
        { name: "全國省道", system: "交通部 TDX 運輸資料流通服務", url: "https://tdx.transportdata.tw/", status: "中央 API" },
    ];

    return (
        <div className={`infoBlockContainer ${getCSSState(makerMessage)}`}>
            <div className='infoBlock maker'>
                <CloseButton handleMakerMessageClick={handleMakerMessageClick} />
                <div className='makerMessage flex' style={{ padding: '2em 1.5em', fontSize: '14px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#25a19c', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-map-marked-alt" /> 全台道路施工地圖與資料來源
                        </h3>
                        <p style={{ margin: '0 0 15px 0', color: '#666', lineHeight: '1.6' }}>
                            本站整合目前可穩定取得的縣市道路挖掘與施工資訊，每日由自動化系統定時同步資料。
                        </p>

                        <div style={{ backgroundColor: '#f5f9f8', padding: '12px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #25a19c' }}>
                            <strong style={{ color: '#25a19c' }}>🟢 已開通即時地圖縣市：</strong>
                            <div style={{ marginTop: '5px', color: '#333' }}>
                                • <strong>臺北市</strong>（每日自動更新）<br />
                                • <strong>臺中市</strong>（每日自動更新）<br />
                                • <strong>高雄市</strong>（每日自動更新）<br />
                                • <strong>彰化縣</strong>（每日自動更新）<br />
                                • <strong>基隆市</strong>（每日自動更新）
                            </div>
                        </div>

                        <h4 style={{ margin: '15px 0 10px 0', color: '#444', fontSize: '15px' }}>
                            🏛️ 其他縣市官方查詢管道與系統一覽：
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {externalCitySources.map((item, idx) => (
                                <a
                                    key={idx}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 12px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        color: '#333',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#25a19c'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                                >
                                    <div>
                                        <strong style={{ color: '#25a19c', marginRight: '8px' }}>{item.name}</strong>
                                        <span style={{ color: '#555' }}>{item.system}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#888', background: '#eee', padding: '2px 8px', borderRadius: '10px' }}>
                                        {item.status} <i className="fas fa-external-link-alt" style={{ marginLeft: '3px', fontSize: '10px' }} />
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MakerMessage;
