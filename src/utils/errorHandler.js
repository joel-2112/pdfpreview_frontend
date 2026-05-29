export const parseError = (error) => {
  if (!error) return 'An unexpected error occurred.';
  
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (typeof data === 'string') return data;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Network connection failure. Please verify the backend is running.';
};
export default parseError;
