const ProgressBar = ({ isLoading }) => isLoading ? (
    <div className="progress">
        <span className="progress-bar" />
    </div>
) : null;

export default ProgressBar;