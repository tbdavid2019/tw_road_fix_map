const CardMini = (props) => {
    let data = props.value;
    if (!data) return null;
    const isWorking = data.workingState === '是';

    return (
        <div className='cardMini'>
            <div className='cardMiniHeader'>
                <span className={`statusBadge ${isWorking ? 'working' : 'notWorking'}`}>
                    <span className='statusDot' />
                    {isWorking ? '施工中' : '未施工'}
                </span>
                <h4 className='pipeType'>{data.pipeType}</h4>
            </div>
            <div className='cardMiniDate'>
                <i className="far fa-calendar-alt" />
                <span>
                    {data.date.start.year}/{data.date.start.month}/{data.date.start.day} ➔ {data.date.end.year}/{data.date.end.month}/{data.date.end.day}
                </span>
            </div>
            <div className='cardMiniRow'>
                <span className='label'>類別</span>
                <span className='val'>{data.constructionType}</span>
            </div>
            <div className='cardMiniRow'>
                <span className='label'>工程</span>
                <span className='val'>{data.title}</span>
            </div>
            <div className='cardMiniRow'>
                <span className='label'>地點</span>
                <span className='val'>{data.distriction} {data.address}</span>
            </div>
        </div>
    );
};

export default CardMini;