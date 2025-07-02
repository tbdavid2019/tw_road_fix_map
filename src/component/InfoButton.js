const InfoButton = (props)=>{

    let {closeInfoBlock, makerMessage, handleCloseClick, handleMakerMessageClick, userLocation, mapParameters, setMapParameters} = props;

    const handleLocationClick = ()=>{
        let randomNum = Math.random() / 1000000;
        setMapParameters({
            center: {lat:userLocation.lat + randomNum, lng:userLocation.lng + randomNum},
            polygon: mapParameters.polygon,
            zoom: mapParameters.zoom,
            selectMarker: mapParameters.selectMarker,
            closeInfoWindow: false
        });
    }

    return(
        <div className={`infoButtonContainer ${(closeInfoBlock !== false && makerMessage !== true) ? 'open':'close'}`}>
            <div className='button' onClick={handleCloseClick}>
                <i className="fas fa-search fa-lg"/>
            </div>
            <div className='button' onClick={handleLocationClick} style={{display:userLocation===null ? 'none' : ''}}>
                <i className="fas fa-map-marker-alt fa-lg"/>
            </div>
            <div className='button' onClick={()=>{
                handleMakerMessageClick();
            }}>
                <i className="fas fa-info fa-lg"/>
            </div>
        </div>
    );
}

export default InfoButton;