export function getErrorMessage(error) {
  return process.env.NODE_ENV === "development" ? error.message : undefined;
}

export function handleDatabaseError(error) {
  if (error.code === "ER_DUP_ENTRY") {
    return "Dado já cadastrado";
  }
  return getErrorMessage(error);
}
