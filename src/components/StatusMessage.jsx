
function StatusMessage({ type = "error", message }) {
  if (!message) {
    return null;
  }

  const className =
    type === "success" ? "success-message" : "error-message";

  return (
    <p className={className} role={type === "success" ? "status" : "alert"}>
      {message}
    </p>
  );
}

export default StatusMessage;
