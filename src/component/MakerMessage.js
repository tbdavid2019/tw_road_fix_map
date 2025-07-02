import CloseButton from "./CloseButton";
const MakerMessage = (props)=>{

    let {makerMessage, handleMakerMessageClick} = props;

    const getCSSState = (condition)=>{
        let state = '';
        if(condition === null) state = 'hide';
        else if(condition === true) state = 'open';
        else if(condition === false) state = 'close';
        return state;
    }

    return(
        <div className={`infoBlockContainer ${getCSSState(makerMessage)}`}>
        <div className='infoBlock maker'>
            <CloseButton handleMakerMessageClick={handleMakerMessageClick}/>
            <div className='makerMessage flex'>

                <div/>

            </div>
        </div>
        </div>
    );
}

export default MakerMessage;