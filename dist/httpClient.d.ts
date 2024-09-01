/**
 * @file httpClient.ts
 * @description This library is a simple wrapper around the Fetch API, adhering to RFC 9110 standards.
 *
 * WARNING: I'm not a security expert, don't rely on it in production if it's vital to your organization's needs.
 * This is provided AS IS, don't make assumptions about the source code without doing a proper security audit before using it in production!
 *
 * If a well-known established security auditor wants to help improve this code, please submit a pull request and let me know of any vulnerabilities/wrong implementations in code.
 *
 * @version 1.0.0
 * @license MIT
 * @author Hylke Hellinga
 */
import { AuthManager } from "./authManager";
/**
 * The HTTPClient class is a wrapper around the Fetch API, providing methods for
 * making HTTP requests with integrated support for authentication using JWT tokens
 * or secure cookies through the AuthManager class. It supports GET, POST, PUT, DELETE,
 * PATCH, and HEAD methods, while also managing request headers, body, and response handling.
 */
export default class HTTPClient {
    private baseUrl;
    private authManager?;
    private hasWarnedAboutNoAuth;
    /**
     * Initializes the HTTPClient with a base URL and an AuthManager instance.
     * @param {string} baseUrl - The base URL for all requests.
     * @param {AuthManager} authManager - The AuthManager instance to handle authentication.
     */
    constructor(baseUrl: string, authManager: AuthManager);
    /**
     * Performs a GET request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     */
    GET(endpoint: string, headers?: HeadersInit): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>;
    /**
     * Performs a POST request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {any} body - The body of the request.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     */
    POST(endpoint: string, body: any, headers?: HeadersInit): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>;
    /**
     * Performs a PUT request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {any} body - The body of the request.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     */
    PUT(endpoint: string, body: any, headers?: HeadersInit): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>;
    /**
     * Performs a DELETE request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     */
    DELETE(endpoint: string, headers?: HeadersInit): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>;
    /**
     * Performs a PATCH request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {any} body - The body of the request.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     */
    PATCH(endpoint: string, body: any, headers?: HeadersInit): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>;
    /**
     * Performs a HEAD request to retrieve only the headers of a response.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Headers>} - The headers from the response.
     */
    HEAD(endpoint: string, headers?: HeadersInit): Promise<Headers>;
    /**
     * Safely get a header value from HeadersInit.
     * @param {HeadersInit} headers - The headers object.
     * @param {string} key - The header key to retrieve.
     * @returns {string | undefined} - The header value if found, otherwise undefined.
     */
    getHeader(headers: HeadersInit, key: string): string | undefined;
    /**
     * Safely set a header value in HeadersInit.
     * @param {HeadersInit} headers - The headers object.
     * @param {string} key - The header key to set.
     * @param {string} value - The header value to set.
     */
    setHeader(headers: HeadersInit, key: string, value: string): void;
    /**
     * Parses the response based on the Content-Type header and returns the appropriate
     * JavaScript object or data type.
     *
     * @param {Response} response - The fetch API response object.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} The parsed response in its appropriate type.
     * @template Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>
     */
    handleContentType(response: Response): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>;
    /**
     * Handles HTTP status codes by providing appropriate actions or messages based on the status code.
     *
     * @param {Response} response - The fetch API response object.
     * @returns {Promise<void>} - A promise that resolves if the status code is handled successfully, or rejects with an error if the status code indicates a failure.
     * @throws {Error} - Throws an error for client-side or server-side errors.
     */
    handleStatusCode(response: Response): Promise<void>;
    /**
    * Handles the request body based on the HTTP method and body type.
    * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, PATCH).
    * @param {any} body - The body of the request.
    * @returns {BodyInit | null} - The processed body suitable for the fetch API or null if no body is needed.
    */
    private handleBody;
    /**
     * Processes the headers for the request, adding the `Content-Type` header if the body is JSON
     * and no `Content-Type` is specified. This ensures that the appropriate `Content-Type` is set based on the body type.
     *
     * @param {HeadersInit} headers - The headers for the request.
     * @param {any} body - The body of the request. Used to determine if a `Content-Type` should be added.
     * @returns {HeadersInit} - The processed headers with any necessary modifications.
     */
    private handleHeaders;
    /**
     * Handles the request by processing the headers and body, enforcing security checks,
     * and making the fetch call. This method supports various HTTP methods (GET, POST, PUT, DELETE, PATCH)
     * and manages the request lifecycle including error handling.
     *
     * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, PATCH).
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {any} [body] - The body of the request, if applicable.
     * @param {HeadersInit} [headers={}] - The headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     * @throws {Error} - Throws an error if the request fails or if security checks are violated.
     */
    private request;
    /**
     * Handles a HEAD request to retrieve only the headers of a response.
     * @param {string} method - The HTTP method (should be 'HEAD').
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers={}] - The headers for the request.
     * @returns {Promise<Headers>} - The headers from the response.
     * @throws {Error} - Throws an error if the request fails.
     */
    private headRequest;
    /**
     * Enforces OWASP security rules, such as avoiding insecure authentication schemes,
     * ensuring API keys and credentials are not passed in URLs or headers in an insecure manner,
     * checking for secure cookie authentication, and enforcing secure protocols.
     * @param {HeadersInit} headers - The headers for the request.
     * @throws {Error} - Throws an error if any OWASP security rules are violated.
     */
    private checkSecurity;
    /**
     * Checks cookie attributes to ensure they follow OWASP guidelines for secure authentication.
     * @param {string} cookie - The cookie header from the request.
     * @throws {Error} - Throws an error if cookie attributes do not meet security requirements.
     */
    private checkCookieSecurity;
}
