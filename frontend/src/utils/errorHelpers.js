/**
 * Transforms raw backend errors into graceful, luxury fashion D2C messages
 */
export function formatErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (typeof error === 'string') return transformRawString(error);

  // Axios response error
  if (error.response) {
    const data = error.response.data;
    
    // Check if 422 validation errors array is present
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(err => err.message || `${err.field} is invalid`).join('. ');
    }

    if (data?.message) {
      return transformRawString(data.message);
    }

    if (error.response.status === 429) {
      return "You're moving a little fast. Please try again in a moment.";
    }

    if (error.response.status === 401) {
      return "Please sign in to continue with your bag or saved edit.";
    }

    if (error.response.status === 403) {
      return "You do not have access to this area.";
    }

    if (error.response.status === 404) {
      return "The requested saree or record could not be found.";
    }

    if (error.response.status >= 500) {
      return "Our boutique servers are taking a brief pause. Please try again in a moment.";
    }
  }

  if (error.message === 'Network Error') {
    return 'Unable to connect to the store servers. Please check your internet connection.';
  }

  return error.message || 'Something went wrong. Please try again.';
}

function transformRawString(msg) {
  const lower = msg.toLowerCase();

  if (lower.includes('out of stock') || lower.includes('insufficient stock')) {
    return 'This saree is currently unavailable.';
  }
  if (lower.includes('only') && lower.includes('available')) {
    return msg; // e.g. "Only 2 items available"
  }
  if (lower.includes('too many') || lower.includes('rate limit')) {
    return "You're moving a little fast. Please try again in a moment.";
  }
  if (lower.includes('invalid email or password')) {
    return 'The email or password entered does not match our records.';
  }
  if (lower.includes('user already exist')) {
    return 'An account with this email address already exists.';
  }
  if (lower.includes('otp expired')) {
    return 'Your verification code has expired. Please request a new one.';
  }
  if (lower.includes('invalid otp')) {
    return 'The verification code entered is incorrect.';
  }
  if (lower.includes('cart is empty')) {
    return 'Your shopping bag is currently empty.';
  }

  return msg;
}
