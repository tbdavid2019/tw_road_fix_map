import { useMemo, useState, useEffect } from 'react';
import Card from './Card';
import CloseButton from './CloseButton';
import Pagination from './Pagination';
import Selectors from './Selectors';

const InfoBlock = (props) => {
    const { closeInfoBlock, handleCloseClick, isMobile } = props;
    const [pageIndex, setPageIndex] = useState(0);
    const [countdown, setCountdown] = useState(10);

    // 倒數計時器
    useEffect(() => {
        if (props.value === 'loading' && props.isLoading) {
            setCountdown(10);
            const timer = setInterval(() => {
                setCountdown((prev) => {
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

    let cardsNum = useMemo(() => {
        let arr = [];
        let length = 0;

        if (props.value === null) return [];
        else if (props.value.length > 1) length = props.value[pageIndex].length;
        else if (props.value.length === 1) length = props.value[0].length;
        else length = 0;

        arr = Array.from({ length: length }, (_, index) => index);
        return arr;
    }, [props.value, pageIndex]);

    const handlePaginationClick = (x) => {
        if (x > props.value.length - 1 || x < 0) return;
        const topAnchor = document.getElementById('topAnchor');
        if (topAnchor) topAnchor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setPageIndex(x);
    };

    const getCSSState = (condition) => {
        let state = '';
        if (condition === null) state = 'hide';
        else if (condition === true) state = 'close';
        else if (condition === false) state = 'open';
        if (props.isInBottomSheet) state += ' bottom-sheet-mode';
        return state;
    };

    if (props.value === 'loading' && props.isLoading) {
        return (
            <div className={`infoBlockContainer ${props.isInBottomSheet ? 'bottom-sheet-mode' : ''}`}>
                <div className='infoBlock loadingBlock'>
                    <div className='loadingContent'>
                        <div className="googleSpinner" />
                        <div className='loadingTextWrapper'>
                            <p className='loadingTitle'>
                                載入施工資料中...
                            </p>
                            <p className='loadingSubtitle'>
                                {countdown > 0 ? `預計還需 ${countdown} 秒，您可以先縮放移動地圖` : '資料即將準備就緒...'}
                            </p>
                            <div className='loadingProgressBar'>
                                <div
                                    className='loadingProgressFill'
                                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else if (props.value === null) {
        return (
            <div className={`infoBlockContainer ${props.isInBottomSheet ? 'bottom-sheet-mode' : ''}`}>
                <div className='infoBlock'>
                    <div className='noContent'>
                        <div className='exclamationMark'>
                            <i className="fas fa-exclamation-triangle fa-lg" />
                        </div>
                        <div>發生錯誤，請稍後再試</div>
                    </div>
                </div>
            </div>
        );
    } else if (props.length === 0) {
        return (
            <div className={`infoBlockContainer ${getCSSState(closeInfoBlock)}`}>
                <div className='infoBlock'>
                    <div className='panelHeader'>
                        <div className='panelTitleGroup'>
                            <i className="fas fa-tools panelTitleIcon" />
                            <span className='panelTitle'>道路施工資訊</span>
                        </div>
                        <CloseButton handleCloseClick={handleCloseClick} />
                    </div>
                    <div className='toolbarContainer'>
                        <Selectors
                            options={props.option}
                            condition={props.condition}
                            mapParameters={props.mapParameters}
                            setCondition={props.setCondition}
                            setMapParameters={props.setMapParameters}
                            setPageIndex={setPageIndex}
                            constructionsData={props.constructionsData}
                        />
                    </div>
                    <div className='cardsListContainer'>
                        <div className='cardsList'>
                            <div className='noContent'>
                                <i className="fas fa-clipboard-list noContentIcon" />
                                <p>沒有符合篩選條件的施工資料</p>
                                <span>請嘗試切換縣市、地區或重設日期區間</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        let pageBtns = Array.from({ length: props.value.length }, (_, index) => index);
        return (
            <div className={`infoBlockContainer ${getCSSState(closeInfoBlock)}`}>
                <div className='infoBlock'>
                    <div className='panelHeader'>
                        <div className='panelTitleGroup'>
                            <i className="fas fa-tools panelTitleIcon" />
                            <span className='panelTitle'>道路施工資訊</span>
                            {props.value && props.value.length > 0 && (
                                <span className='panelPageBadge'>
                                    {pageIndex + 1} / {props.value.length} 頁
                                </span>
                            )}
                        </div>
                        <CloseButton handleCloseClick={handleCloseClick} />
                    </div>
                    <div className='toolbarContainer'>
                        <Selectors
                            options={props.option}
                            condition={props.condition}
                            setCondition={props.setCondition}
                            setPageIndex={setPageIndex}
                            mapParameters={props.mapParameters}
                            setMapParameters={props.setMapParameters}
                            constructionsData={props.constructionsData}
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
                            <div id='topAnchor' style={{ marginBottom: '1em' }} />
                            <div
                                className={props.isInBottomSheet ? "horizontal-scroll-container" : ""}
                                style={
                                    props.isInBottomSheet
                                        ? {
                                              display: 'flex',
                                              overflowX: 'auto',
                                              scrollSnapType: 'x mandatory',
                                              gap: '12px',
                                              paddingBottom: '10px',
                                          }
                                        : {}
                                }
                            >
                                {cardsNum.map((i) => (
                                    <div
                                        key={'card' + (pageIndex * 10 + i + 1)}
                                        style={
                                            props.isInBottomSheet
                                                ? { flex: '0 0 85%', scrollSnapAlign: 'start' }
                                                : {}
                                        }
                                    >
                                        <Card
                                            value={props.value[pageIndex][i]}
                                            setMapParameters={props.setMapParameters}
                                        />
                                    </div>
                                ))}
                            </div>
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
};

export default InfoBlock;