import { useState } from 'react';

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
            center: { lat: data.coordinate.lat + randomNum, lng: data.coordinate.lng + randomNum },
            polygon: data.coordinate.polygon,
            zoom: 17 + randomNum,
            selectMarker: data,
            closeInfoWindow: false
        });
    };

    if (data === 'loading') {
        return (
            <div className='card loading'>
                <div className='cardSkeleton'>載入中...</div>
            </div>
        );
    }

    const isWorking = data.workingState === '是';

    return (
        <div className='card'>
            <div className='card-header'>
                <span className={`statusBadge ${isWorking ? 'working' : 'notWorking'}`}>
                    <span className='statusDot' />
                    {isWorking ? '施工中' : '未施工'}
                </span>
                <h3 className='pipeType'>{data.pipeType}</h3>
            </div>

            <div className='card-meta-basicInfo'>
                <div className='dateRow'>
                    <i className="far fa-calendar-alt dateIcon" />
                    <span className='dateText'>
                        {data.date.start.year}/{data.date.start.month}/{data.date.start.day}
                    </span>
                    <span className='dateArrow'>➔</span>
                    <span className='dateText'>
                        {data.date.end.year}/{data.date.end.month}/{data.date.end.day}
                    </span>
                </div>
                <div className='infoRow'>
                    <span className='infoLabel'>類別</span>
                    <span className='infoContent'>{data.constructionType}</span>
                </div>
                <div className='infoRow'>
                    <span className='infoLabel'>地點</span>
                    <span className='infoContent'>{data.distriction} {data.address}</span>
                </div>
            </div>

            <div className='cardActions'>
                {(data.coordinate.lat !== 0 && data.coordinate.lng !== 0) && (
                    <button
                        type='button'
                        title='在地圖上查看位置'
                        className='cardActionBtn locateBtn'
                        onClick={handleLocationData}
                    >
                        <i className="fas fa-crosshairs" />
                        <span>查看位置</span>
                    </button>
                )}
                <button
                    type='button'
                    title={showLess ? '展開詳細工程資訊' : '收合資訊'}
                    className={`cardActionBtn moreBtn ${!showLess ? 'expanded' : ''}`}
                    onClick={handleClick}
                >
                    <span>{showLess ? '詳細資訊' : '收合資訊'}</span>
                    <i className={`fas fa-chevron-${showLess ? 'down' : 'up'}`} />
                </button>
            </div>

            {!showLess && (
                <div className='card-body'>
                    <div className='cardDivider' />
                    <div className='card-body-detailInfo'>
                        <div className='detailRow fullWidth'>
                            <span className='detailLabel'>工程名稱</span>
                            <span className='detailValue constructTitle'>{data.title}</span>
                        </div>
                        <div className='detailRow'>
                            <span className='detailLabel'>申請書編號</span>
                            <span className='detailValue'>{data.applicationNumber}</span>
                        </div>
                        <div className='detailRow'>
                            <span className='detailLabel'>許可證編號</span>
                            <span className='detailValue'>{data.licenseNumber}</span>
                        </div>
                        <div className='detailRow fullWidth'>
                            <span className='detailLabel'>申請單位</span>
                            <span className='detailValue'>{data.applicant}</span>
                        </div>
                        <div className='detailRow'>
                            <span className='detailLabel'>施工廠商</span>
                            <span className='detailValue'>
                                {data.contractor.name}
                                {data.contractor.phone && data.contractor.phone !== 'N/A' && (
                                    <a className='phoneLink' href={`tel:${data.contractor.phone}`}>
                                        <i className="fas fa-phone-alt" /> {data.contractor.phone}
                                    </a>
                                )}
                            </span>
                        </div>
                        <div className='detailRow'>
                            <span className='detailLabel'>現場負責人</span>
                            <span className='detailValue'>
                                {data.personInCharge.name}
                                {data.personInCharge.phone && data.personInCharge.phone !== 'N/A' && (
                                    <a className='phoneLink' href={`tel:${data.personInCharge.phone}`}>
                                        <i className="fas fa-phone-alt" /> {data.personInCharge.phone}
                                    </a>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Card;