/**
 * Minions Workflows SDK
 *
 * Workflow definitions, step sequences, transitions, and run history
 *
 * @module @minions-workflows/sdk
 */

export const VERSION = '0.1.0';

/**
 * Example: Create a client instance for Minions Workflows.
 * Replace this with your actual SDK entry point.
 */
export function createClient(options = {}) {
    return {
        version: VERSION,
        ...options,
    };
}

export * from './schemas/index.js';
