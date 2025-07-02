
const CardMini = (props)=>{
    let data = props.value;
    return(
        <div className='cardMini'>
            <div className='title'>
                <div className={`state inlineBlock ${data.workingState === '是' ? 'working' : 'notWorking'}`}>
                    {data.workingState === '是' ? '施工中' : '未施工'}
                </div>
                <div className='pipeType inlineBlock'>
                    {data.pipeType}
                </div>
            </div>
            <div className='title'>
                <div className='date'>
                    <span className='slash'>{data.date.start.year}</span><span className='slash'>{data.date.start.month}</span><span>{data.date.start.day}</span>
                    <i className="fas fa-caret-right fa-lg"/>
                    <span className='slash'>{data.date.end.year}</span><span className='slash'>{data.date.end.month}</span><span>{data.date.end.day}</span>
                </div>
            </div>
            <div>
                <div className='item'>案件類別</div>
                <div className='data'>{data.constructionType}</div>
            </div>
            <div>
                <div className='item'>工程名稱</div>
                <div className='data'>{data.title}</div>
            </div>
            <div>
                <div className='item'>地點</div>
                <div className='data last'>{data.distriction + data.address}</div>
            </div>
        </div>
    );
}

export default CardMini;