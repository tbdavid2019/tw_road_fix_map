const Pagination = (props)=>{
    //必須變數from Card list，依賴Card list
    //不能用[]
    const {margin ,pageBtns, pageIndex, isMobile} = props;
    //PageButtons有自己的handleClick，變數名稱有衝突
    //另外用一個變數儲存從CardList傳來的handleClick，而不解構賦值
    const handleBtnClick = props.handlePaginationClick;
    let returnElement = null;
    let minPageIndex = 0, maxPageIndex = pageBtns.length - 1;

    const focusPage = (i)=>{
        if( i === pageIndex ) return 'currentPage';
    }

    if(pageBtns.length === 1) return null;
    if(isMobile){
        let pageBtnsArr = Array.from({length:pageBtns.length}, (_,index)=>index);
        let selectValue = null;
        returnElement=
        <div className='pagination unselectable'>
            <div className=' pageArrow' key={`prePage`}
                onClick={()=>{
                    selectValue = pageIndex-1;
                    handleBtnClick(selectValue);
                    if(selectValue > minPageIndex) document.getElementById('pageSelect').value = selectValue;
                }}
            >
                <i className="fas fa-chevron-left"/>
            </div>
            <div className='pageElement'>
                <i className="selectArrow fas fa-chevron-down fa-lg"/>
                <span>{pageIndex+1}</span>
                <select id='pageSelect'
                        value={pageIndex}
                        onChange={(e)=>handleBtnClick(Number(e.target.value))}
                >
                    {
                        pageBtnsArr.map((i)=>(
                            <option value={i}
                                    key={'pageSelect_'+(i+1)}>
                                {i+1}
                            </option>
                        ))
                    }
                </select>
            </div>
            <div className=' pageArrow' key={`nextPage`}
                onClick={()=>{
                    selectValue = pageIndex+1;
                    handleBtnClick(selectValue);
                    if(selectValue < maxPageIndex) document.getElementById('pageSelect').value = selectValue;}}
                >
                <i className="fas fa-chevron-right"/>
            </div>
        </div>;
    }else{    
        if(pageBtns.length > 7){
            if(pageIndex - minPageIndex > 3 && maxPageIndex - pageIndex > 3){
                let pages = Array.from({length:3},(_,index)=>index+pageIndex-1);
                returnElement = 
                <div className={`pagination unselectable ${margin}`}>
                    <div className='pageElement pageArrow' key={`prePage`}
                        onClick={()=>{handleBtnClick(pageIndex-1)}}>
                        <i className="fas fa-chevron-left"/>
                    </div>
                    <div key={'page-'+minPageIndex+1}
                        onClick={()=>{handleBtnClick(minPageIndex)}}
                        className={`pageElement pageBtn ${focusPage(minPageIndex)}`}>
                        {minPageIndex+1}
                    </div>
                    <div className='pageElement dot'/>
                    {
                        pages.map((i)=>(
                            <div key={'page'+(i+1)}
                                onClick={()=>{handleBtnClick(i)}}
                                className={`pageElement pageBtn ${focusPage(i)}`}>
                                {i+1}
                            </div>
                        ))
                    }
                    <div className='pageElement dot'/>
                    <div key={'page-'+maxPageIndex+1}
                        onClick={()=>{handleBtnClick(maxPageIndex)}}
                        className={`pageElement pageBtn ${focusPage(maxPageIndex)}`}>
                        {maxPageIndex+1}
                    </div>
                    <div className='pageElement pageArrow' key={`nextPage`}
                        onClick={()=>{handleBtnClick(pageIndex+1)}}>
                        <i className="fas fa-chevron-right"/>
                    </div>
                </div>
            }else if(pageIndex - minPageIndex <= 3){
                let pages = Array.from({length:5},(_,index)=>index);
                returnElement = 
                <div className={`pagination unselectable ${margin}`}>
                    <div className='pageElement pageArrow' key={`prePage`}
                        style={pageIndex===minPageIndex ? {visibility: 'hidden'} : {}}
                        onClick={()=>{handleBtnClick(pageIndex-1)}}>
                        <i className="fas fa-chevron-left"/>
                    </div>
                    {
                        pages.map((i)=>(
                            <div key={'page-'+(i+1)}
                                onClick={()=>{handleBtnClick(i)}}
                                className={`pageElement pageBtn ${focusPage(i)}`}>
                                {i+1}
                            </div>
                        ))
                    }
                    <div className='pageElement dot'/>
                    <div key={'page-'+maxPageIndex+1}
                        onClick={()=>{handleBtnClick(maxPageIndex)}}
                        className={`pageElement pageBtn ${focusPage(maxPageIndex)}`}>
                        {maxPageIndex+1}
                    </div>
                    <div className='pageElement pageArrow' key={`nextPage`}
                        onClick={()=>{handleBtnClick(pageIndex+1)}}>
                        <i className="fas fa-chevron-right"/>
                    </div>
                </div>
            }else if(maxPageIndex - pageIndex <= 3){
                let pages = Array.from({length:5},(_,index)=>index+maxPageIndex-4);
                returnElement = 
                <div className={`pagination unselectable ${margin}`}>
                    <div className='pageElement pageArrow' key={`prePage`}
                        onClick={()=>{handleBtnClick(pageIndex-1)}}>
                        <i className="fas fa-chevron-left"/>
                    </div>
                    <div key={'page-'+minPageIndex+1}
                        onClick={()=>{handleBtnClick(minPageIndex)}}
                        className={`pageElement pageBtn ${focusPage(minPageIndex)}`}>
                        {minPageIndex+1}
                    </div>
                    <div className='pageElement dot'/>
                    {
                        pages.map((i)=>(
                            <div key={'page-'+(i+1)}
                                onClick={()=>{handleBtnClick(i)}}
                                className={`pageElement pageBtn ${focusPage(i)}`}>
                                {i+1}
                            </div>
                        ))
                    }
                    <div className='pageElement pageArrow' key={`nextPage`}
                        style={pageIndex===maxPageIndex ? {visibility: 'hidden'} : {}}
                        onClick={()=>{handleBtnClick(pageIndex+1)}}>
                        <i className="fas fa-chevron-right"/>
                    </div>
                </div>
            }
        }else{
            returnElement = 
            <div className={`pagination unselectable ${margin}`}>
                {
                    pageBtns.map((i)=>(
                        <div key={'page-'+(i+1)}
                            onClick={()=>{handleBtnClick(i)}}
                            className={`pageElement pageBtn ${focusPage(i)}`}>
                            {i+1}
                        </div>
                    ))
                }
            </div>
        }
    }
    return(returnElement);
}

export default Pagination;