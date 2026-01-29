/**
 * MCP Elicitation Types (MCP 2025-06-18 / 2025-11-25 spec)
 * Enables servers to request user input through the client
 */

/**
 * Elicitation mode - how user input is collected
 */
export type ElicitationMode = "form" | "url";

/**
 * Base elicitation request
 */
export interface ElicitationRequestBase {
  /** Unique identifier for this elicitation */
  elicitationId: string;
  /** Human-readable message explaining what's needed */
  message: string;
}

/**
 * Form mode elicitation - structured input via JSON Schema
 */
export interface FormElicitationRequest extends ElicitationRequestBase {
  mode: "form";
  /** JSON Schema for the form fields */
  schema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * URL mode elicitation - redirect to external URL (OAuth, etc.)
 */
export interface UrlElicitationRequest extends ElicitationRequestBase {
  mode: "url";
  /** External URL for user to complete action */
  url: string;
}

export type ElicitationRequest = FormElicitationRequest | UrlElicitationRequest;

/**
 * User action in response to elicitation
 */
export type ElicitationAction = "accept" | "decline" | "cancel";

/**
 * Response to form elicitation
 */
export interface FormElicitationResponse {
  action: ElicitationAction;
  /** Form data if action is 'accept' */
  content?: Record<string, unknown>;
}

/**
 * Response to URL elicitation (user consented to open URL)
 */
export interface UrlElicitationResponse {
  action: ElicitationAction;
}

/**
 * Elicitation completion notification
 */
export interface ElicitationCompleteNotification {
  elicitationId: string;
}

/**
 * Internal state for tracking elicitations through the proxy
 */
export interface ElicitationState {
  elicitationId: string;
  clientSessionId: string;
  backendServerId: string;
  mode: ElicitationMode;
  createdAt: number;
  status: "pending" | "completed" | "expired" | "cancelled";
}

/**
 * MCP Error code for URL elicitation required
 */
export const URL_ELICITATION_REQUIRED_ERROR = -32042;
