/**
 * Utility functions for handling blockchain transactions
 */

/**
 * Send a transaction to the Monad blockchain
 * @param {Object} contract - The contract instance
 * @param {string} method - The method name to call
 * @param {Array} params - The parameters to pass to the method
 * @returns {Promise} Transaction promise
 */
export const sendMonadTransaction = async (contract, method, params = []) => {
    if (!contract) {
      throw new Error('Contract instance is required');
    }
    
    try {
      // Create transaction
      const tx = await contract[method](...params);
      
      // Return transaction for caller to handle
      return tx;
    } catch (error) {
      // Handle common transaction errors
      return handleTransactionError(error);
    }
  };
  
  /**
   * Calculate gas estimate for a transaction
   * @param {Object} contract - The contract instance
   * @param {string} method - The method name to call
   * @param {Array} params - The parameters to pass to the method
   * @returns {Promise<number>} Estimated gas
   */
  export const calculateGasEstimate = async (contract, method, params = []) => {
    try {
      const estimatedGas = await contract.estimateGas[method](...params);
      // Add a buffer for safety
      return Math.floor(estimatedGas.toNumber() * 1.2);
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw new Error('Failed to estimate gas for transaction');
    }
  };
  
  /**
   * Create a transaction payload
   * @param {string} method - The method name
   * @param {Array} params - The parameters
   * @returns {Object} Transaction payload
   */
  export const createTransactionPayload = (method, params = []) => {
    return {
      method,
      params,
      timestamp: Date.now(),
    };
  };
  
  /**
   * Format transaction data for display
   * @param {Object} transaction - The transaction object
   * @returns {Object} Formatted transaction data
   */
  export const formatTransaction = (transaction) => {
    return {
      hash: transaction.hash,
      method: transaction.method || 'Unknown Method',
      status: transaction.status || 'Pending',
      timestamp: new Date().toISOString(),
      value: transaction.value ? transaction.value.toString() : '0',
    };
  };
  
  /**
   * Format transaction receipt for display
   * @param {Object} receipt - The transaction receipt
   * @returns {Object} Formatted receipt
   */
  export const formatTransactionReceipt = (receipt) => {
    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status ? 'Success' : 'Failed',
      events: Object.keys(receipt.events || {}).map(eventName => ({
        name: eventName,
        data: receipt.events[eventName].returnValues
      })),
    };
  };
  
  /**
   * Handle common transaction errors
   * @param {Error} error - The error object
   * @throws {Error} Enhanced error object
   */
  export const handleTransactionError = (error) => {
    // Extract error message
    const message = error.message || 'Unknown transaction error';
    
    // Check for common error types
    if (message.includes('user rejected')) {
      throw new Error('Transaction was rejected by the user');
    } else if (message.includes('insufficient funds')) {
      throw new Error('Insufficient funds for transaction');
    } else if (message.includes('gas')) {
      throw new Error('Gas estimation failed. The transaction might fail.');
    } else if (message.includes('nonce')) {
      throw new Error('Transaction nonce error. Please retry.');
    }
    
    // Re-throw original error for other cases
    throw error;
  };
  
  /**
   * Wait for transaction confirmation
   * @param {Object} transaction - The transaction object
   * @param {number} confirmations - Number of confirmations to wait for
   * @returns {Promise<Object>} Transaction receipt
   */
  export const waitForTransaction = async (transaction, confirmations = 1) => {
    if (!transaction) {
      throw new Error('Transaction object is required');
    }
    
    try {
      // Wait for transaction to be mined
      const receipt = await transaction.wait(confirmations);
      return receipt;
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw new Error('Failed to confirm transaction');
    }
  };