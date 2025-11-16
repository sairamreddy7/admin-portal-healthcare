// backend/utils/externalApiClient.js
const axios = require('axios');

/**
 * API Client for communicating with external Doctor and Patient Portal services
 * Handles authentication, error handling, and request/response formatting
 */

class ExternalApiClient {
  constructor() {
    this.doctorServiceUrl = process.env.DOCTOR_SERVICE_URL || 'http://localhost:3000/api';
    this.patientServiceUrl = process.env.PATIENT_SERVICE_URL || 'http://localhost:3000/api';
    this.doctorApiKey = process.env.DOCTOR_SERVICE_API_KEY;
    this.patientApiKey = process.env.PATIENT_SERVICE_API_KEY;
    this.timeout = parseInt(process.env.EXTERNAL_API_TIMEOUT || '10000', 10);
  }

  /**
   * Make a request to the Doctor Service
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
   * @param {string} endpoint - API endpoint (e.g., '/doctors', '/doctors/123')
   * @param {object} data - Request body (for POST, PUT, PATCH)
   * @param {object} params - Query parameters
   * @param {object} headers - Additional headers
   * @returns {Promise<object>} Response data
   */
  async doctorService(method, endpoint, data = null, params = {}, headers = {}) {
    return this._makeRequest(
      this.doctorServiceUrl,
      this.doctorApiKey,
      method,
      endpoint,
      data,
      params,
      headers
    );
  }

  /**
   * Make a request to the Patient Service
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body
   * @param {object} params - Query parameters
   * @param {object} headers - Additional headers
   * @returns {Promise<object>} Response data
   */
  async patientService(method, endpoint, data = null, params = {}, headers = {}) {
    return this._makeRequest(
      this.patientServiceUrl,
      this.patientApiKey,
      method,
      endpoint,
      data,
      params,
      headers
    );
  }

  /**
   * Internal method to make HTTP requests
   * @private
   */
  async _makeRequest(baseUrl, apiKey, method, endpoint, data, params, headers) {
    try {
      // Ensure endpoint starts with /
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${baseUrl}${path}`;

      // Prepare request config
      const config = {
        method: method.toUpperCase(),
        url,
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        params,
      };

      // Add API key authentication if available
      if (apiKey) {
        config.headers['X-API-Key'] = apiKey;
      }

      // Add request body for POST, PUT, PATCH
      if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        config.data = data;
      }

      // Make the request
      const response = await axios(config);

      return {
        success: true,
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      return this._handleError(error, baseUrl, endpoint);
    }
  }

  /**
   * Handle errors from external API calls
   * @private
   */
  _handleError(error, baseUrl, endpoint) {
    const errorResponse = {
      success: false,
      error: 'External API Error',
      service: baseUrl,
      endpoint,
    };

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorResponse.status = error.response.status;
      errorResponse.statusText = error.response.statusText;
      errorResponse.message = error.response.data?.message || error.response.data?.error || 'Unknown error';
      errorResponse.data = error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      errorResponse.status = 503;
      errorResponse.message = 'Service unavailable - No response from external service';
      errorResponse.details = 'The external service may be down or unreachable';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorResponse.status = 500;
      errorResponse.message = error.message || 'Failed to make request to external service';
    }

    // Log the error for debugging
    console.error('External API Error:', {
      service: baseUrl,
      endpoint,
      error: errorResponse,
    });

    return errorResponse;
  }

  /**
   * Check if external services are available
   * @returns {Promise<object>} Health status of external services
   */
  async checkHealth() {
    const results = {
      doctorService: { available: false, responseTime: null },
      patientService: { available: false, responseTime: null },
    };

    // Check Doctor Service
    try {
      const startTime = Date.now();
      const response = await axios.get(`${this.doctorServiceUrl}/health`, {
        timeout: 5000,
        headers: this.doctorApiKey ? { 'X-API-Key': this.doctorApiKey } : {},
      });
      results.doctorService.available = response.status === 200;
      results.doctorService.responseTime = Date.now() - startTime;
      results.doctorService.data = response.data;
    } catch (error) {
      results.doctorService.error = error.message;
    }

    // Check Patient Service
    try {
      const startTime = Date.now();
      const response = await axios.get(`${this.patientServiceUrl}/health`, {
        timeout: 5000,
        headers: this.patientApiKey ? { 'X-API-Key': this.patientApiKey } : {},
      });
      results.patientService.available = response.status === 200;
      results.patientService.responseTime = Date.now() - startTime;
      results.patientService.data = response.data;
    } catch (error) {
      results.patientService.error = error.message;
    }

    return results;
  }

  // ==================== Doctor Service Methods ====================

  /**
   * Get all doctors from external service
   */
  async getDoctors(params = {}) {
    return this.doctorService('GET', '/doctors', null, params);
  }

  /**
   * Get paginated doctors list
   */
  async getDoctorsPaginated(params = {}) {
    return this.doctorService('GET', '/doctors/paginated', null, params);
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(id) {
    return this.doctorService('GET', `/doctors/${id}`);
  }

  /**
   * Create new doctor
   */
  async createDoctor(doctorData) {
    return this.doctorService('POST', '/doctors', doctorData);
  }

  /**
   * Update doctor
   */
  async updateDoctor(id, doctorData) {
    return this.doctorService('PUT', `/doctors/${id}`, doctorData);
  }

  /**
   * Delete doctor
   */
  async deleteDoctor(id) {
    return this.doctorService('DELETE', `/doctors/${id}`);
  }

  // ==================== Patient Service Methods ====================

  /**
   * Get all patients from external service
   */
  async getPatients(params = {}) {
    return this.patientService('GET', '/patients', null, params);
  }

  /**
   * Get patient by ID
   */
  async getPatientById(id) {
    return this.patientService('GET', `/patients/${id}`);
  }

  /**
   * Get current patient profile
   */
  async getPatientMe(authToken) {
    return this.patientService('GET', '/patients/me', null, {}, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  /**
   * Create new patient
   */
  async createPatient(patientData) {
    return this.patientService('POST', '/patients', patientData);
  }

  /**
   * Update patient
   */
  async updatePatient(id, patientData) {
    return this.patientService('PUT', `/patients/${id}`, patientData);
  }

  /**
   * Delete patient
   */
  async deletePatient(id) {
    return this.patientService('DELETE', `/patients/${id}`);
  }

  // ==================== Appointment Methods ====================

  /**
   * Get all appointments
   */
  async getAppointments(params = {}) {
    return this.doctorService('GET', '/appointments', null, params);
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id) {
    return this.doctorService('GET', `/appointments/${id}`);
  }

  /**
   * Get my appointments (patient-specific)
   */
  async getMyAppointments(authToken) {
    return this.doctorService('GET', '/appointments/mine', null, {}, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  /**
   * Create appointment
   */
  async createAppointment(appointmentData) {
    return this.doctorService('POST', '/appointments', appointmentData);
  }

  /**
   * Update appointment
   */
  async updateAppointment(id, appointmentData) {
    return this.doctorService('PUT', `/appointments/${id}`, appointmentData);
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(id) {
    return this.doctorService('PATCH', `/appointments/${id}/cancel`);
  }

  /**
   * Delete appointment
   */
  async deleteAppointment(id) {
    return this.doctorService('DELETE', `/appointments/${id}`);
  }

  // ==================== Billing Methods ====================

  /**
   * Get invoices
   */
  async getInvoices(params = {}) {
    return this.patientService('GET', '/billing/invoices', null, params);
  }

  /**
   * Get patient balance
   */
  async getBalance(authToken) {
    return this.patientService('GET', '/billing/balance', null, {}, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  /**
   * Get invoice receipt
   */
  async getReceipt(invoiceId) {
    return this.patientService('GET', `/billing/invoices/${invoiceId}/receipt`);
  }

  /**
   * Checkout
   */
  async checkout(checkoutData) {
    return this.patientService('POST', '/billing/checkout', checkoutData);
  }

  // ==================== Messaging Methods ====================

  /**
   * Get unread message count
   */
  async getUnreadCount(authToken) {
    return this.patientService('GET', '/messages/unread-count', null, {}, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  /**
   * Get message threads
   */
  async getThreads(authToken) {
    return this.patientService('GET', '/messages/threads', null, {}, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  /**
   * Get thread by ID
   */
  async getThread(threadId, authToken) {
    return this.patientService('GET', `/messages/threads/${threadId}`, null, {}, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  /**
   * Get messages in thread
   */
  async getMessages(threadId, authToken) {
    return this.patientService('GET', `/messages/threads/${threadId}/messages`, null, {}, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  /**
   * Create message thread
   */
  async createThread(threadData, authToken) {
    return this.patientService('POST', '/messages/threads', threadData, {}, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  /**
   * Post message to thread
   */
  async postMessage(threadId, messageData, authToken) {
    return this.patientService('POST', `/messages/threads/${threadId}/messages`, messageData, {}, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  /**
   * Mark thread as read
   */
  async markThreadRead(threadId, authToken) {
    return this.patientService('POST', `/messages/threads/${threadId}/read`, null, {}, {
      Authorization: `Bearer ${authToken}`,
    });
  }

  // ==================== Prescription Methods ====================

  /**
   * Get medications/prescriptions
   */
  async getPrescriptions(params = {}) {
    return this.patientService('GET', '/prescriptions', null, params);
  }

  // ==================== Test Results Methods ====================

  /**
   * Get test results
   */
  async getTestResults(params = {}) {
    return this.patientService('GET', '/test-results', null, params);
  }

  /**
   * Get test result by ID
   */
  async getTestResultById(id) {
    return this.patientService('GET', `/test-results/${id}`);
  }

  /**
   * Download test result
   */
  async downloadTestResult(id) {
    return this.patientService('GET', `/test-results/${id}/download`);
  }

  // ==================== File/Blob Methods ====================

  /**
   * Get SAS URL for file access
   */
  async getFileSasUrl(params = {}) {
    return this.patientService('GET', '/files/sas', null, params);
  }
}

// Export singleton instance
module.exports = new ExternalApiClient();
