import { useMemo, useState, useEffect } from 'react';
import Card from './Card';
import CloseButton from './CloseButton';
import Pagination from './Pagination';
import Selectors from './Selectors';

const InfoBlock = (props)=>{

    const {closeInfoBlock, handleCloseClick, isMobile} = props;
    const [pageIndex, setPageIndex] = useState(0);
    const [countdown, setCountdown] = useState(10);

    // 倒數計時器
    useEffect(() => {
        if (props.value === 'loading' || props.isLoading) {
            setCountdown(10);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [props.value, props.isLoading]);

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

    if(props.value === 'loading' || props.isLoading){
        return(
            <div className={`infoBlockContainer`}>
            <div className='infoBlock' style={{paddingTop:'0', backgroundColor:'#ececec'}}>
                <div className='loading'>
                    <i className="fas fa-circle-notch fa-lg" style={{
                        animation: 'spin 2s linear infinite',
                        color: '#3498db'
                    }}/>
                    <div style={{
                        marginTop: '15px',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            margin: '0 0 8px 0',
                            color: '#555',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}>
                            載入資料中，您可以先移動地圖...
                        </p>
                        <div style={{
                            fontSize: '14px',
                            color: '#888',
                            background: 'linear-gradient(90deg, #3498db 0%, #2ecc71 50%, #3498db 100%)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold',
                            animation: 'textShimmer 2s ease-in-out infinite'
                        }}>
                            {countdown > 0 ? `預計還需 ${countdown} 秒` : '即將完成...'}
                        </div>
                        <div style={{
                            width: '80%',
                            height: '4px',
                            backgroundColor: '#ddd',
                            borderRadius: '2px',
                            margin: '10px auto',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                backgroundColor: '#3498db',
                                borderRadius: '2px',
                                width: `${((10 - countdown) / 10) * 100}%`,
                                transition: 'width 1s ease-in-out',
                                background: 'linear-gradient(90deg, #3498db, #2ecc71)',
                                animation: 'progressGlow 2s ease-in-out infinite'
                            }}></div>
                        </div>
                    </div>
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