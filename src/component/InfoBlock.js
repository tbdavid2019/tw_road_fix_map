import { useMemo, useState } from 'react';
import Card from './Card';
import CloseButton from './CloseButton';
import Pagination from './Pagination';
import Selectors from './Selectors';

const InfoBlock = (props)=>{

    const {closeInfoBlock, handleCloseClick, isMobile} = props;
    const [pageIndex, setPageIndex] = useState(0);

    let cardsNum = useMemo(()=>{
            let arr = [];
            let length = 0;

            if(props.value === null) return;
            else if(props.value.length > 1) length =  props.value[pageIndex].length;
            else if(props.value.length === 1) length =  props.value[0].length;
            else length = 0;

            arr = Array.from({length: length},(_,index) => index);
            return(arr);
    },[props.value, pageIndex]);

    const handlePaginationClick = (x)=>{
        if(x > (props.value.length - 1) || x < 0) return;
        document.getElementById('topAnchor').scrollIntoView(false);
        setPageIndex(x);
    }
    
    const getCSSState = (condition)=>{
        let state = '';
        if(condition === null) state = 'hide';
        else if(condition === true) state = 'close';
        else if(condition === false) state = 'open';
        return state;
    }

    if(props.value === 'loading'){
        return(
            <div className={`infoBlockContainer`}>
            <div className='infoBlock' style={{paddingTop:'0', backgroundColor:'#ececec'}}>
                <div className='loading'>
                    <i className="fas fa-circle-notch fa-lg"/>
                </div>
            </div>
            </div>
        );
    }
    else if(props.value === null){
        return(
            <div className='infoBlockContainer'>
            <div className='infoBlock'>
                <div className='noContent'>
                    <div className='exclamationMark'><i className="fas fa-exclamation-triangle fa-lg"/></div>
                    <div>發生錯誤，請稍後在試</div>
                </div>
            </div>
            </div>
        );
    }
    else if(props.length === 0){
        return(
            <div className={`infoBlockContainer ${getCSSState(closeInfoBlock)}`}>
            <div className='infoBlock'>
                <CloseButton handleCloseClick={handleCloseClick}/>
                <div className='toolbarContainer'>
                    <Selectors
                        options={props.option}
                        condition={props.condition}
                        mapParameters={props.mapParameters}
                        setCondition={props.setCondition}
                        setMapParameters={props.setMapParameters}
                        setPageIndex={setPageIndex}
                    />
                </div>
                <div className='cardsListContainer'>
                <div className='cardsList'>
                    <div className='noContent'>
                        沒有符合條件的資料
                    </div>
                </div>
                </div>
            </div>
            </div>
        );
    }
    else{
        let pageBtns = Array.from({length: props.value.length},(_,index)=>index);
        return(
            <div className={`infoBlockContainer ${getCSSState(closeInfoBlock)}`}>
            {/* <div className={`infoBlockContainer ${closeInfoBlock ? 'close':'open'}`}> */}
            <div className='infoBlock'>
                <CloseButton handleCloseClick={handleCloseClick}
                />
                <div className='toolbarContainer'>
                    <Selectors
                        options={props.option}
                        condition={props.condition}
                        setCondition={props.setCondition}
                        setPageIndex={setPageIndex}
                        mapParameters={props.mapParameters}
                        setMapParameters={props.setMapParameters}
                    />
                </div>
                <div className='cardsListContainer'>
                <div className='cardsList'>
                    <Pagination
                        pageBtns={pageBtns}
                        pageIndex={pageIndex}
                        handlePaginationClick={handlePaginationClick}
                        isMobile={isMobile}
                    />
                    <div id='topAnchor' style={{marginBottom:'2em'}}/>
                    {
                        cardsNum.map((i)=>(
                            <Card key={'card'+(pageIndex*10+i+1)}
                                value={props.value[pageIndex][i]}
                                setMapParameters={props.setMapParameters}
                            />
                        ))
                    }
                    <Pagination
                        pageBtns={pageBtns}
                        pageIndex={pageIndex}
                        handlePaginationClick={handlePaginationClick}
                        isMobile={isMobile}
                    />
                </div>
                </div>
            </div>
            </div>
        );
    }
}

export default InfoBlock;