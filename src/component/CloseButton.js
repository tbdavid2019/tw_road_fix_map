const CloseButton = (props)=>{

    let {handleCloseClick, handleMakerMessageClick} = props;

    const handleClick = ()=>{
        if(handleCloseClick !== undefined){
            handleCloseClick();
        }
        else if(handleMakerMessageClick !== undefined){
            handleMakerMessageClick();
        }
    }

    return(
        <div className='closeButtonContainer'>
            <div className='closeButton' onClick={handleClick}>
                <i className="fas fa-times fa-lg"/>
            </div>
        </div>
    );
}

export default CloseButton;