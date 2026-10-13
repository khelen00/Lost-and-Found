
function Loading({ message = "Loading..." }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true"></span>
      <p>{message}</p>
    </div>
  );
}

export default Loading;
