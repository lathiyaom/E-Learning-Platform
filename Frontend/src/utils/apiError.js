export const getApiErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback;

  const data = error?.data || error?.response?.data;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => item?.message)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
