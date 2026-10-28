const CloseButton = (props) => {
    let { handleCloseClick, handleMakerMessageClick } = props;

    const handleClick = () => {
        if (handleCloseClick !== undefined) {
            handleCloseClick();
        } else if (handleMakerMessageClick !== undefined) {
            handleMakerMessageClick();
        }
    };

    return (
        <div className='closeButtonContainer'>
            <button
                type="button"
                className='closeButton'
                onClick={handleClick}
                title="收合面板"
                aria-label="收合面板"
            >
                <i className="fas fa-times" />
            </button>
        </div>
    );
};

export default CloseButton;