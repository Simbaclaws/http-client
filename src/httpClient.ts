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
    private baseUrl: string;
    private authManager?: AuthManager;
    private hasWarnedAboutNoAuth: boolean = false;

    /**
     * Initializes the HTTPClient with a base URL and an AuthManager instance.
     * @param {string} baseUrl - The base URL for all requests.
     * @param {AuthManager} authManager - The AuthManager instance to handle authentication.
     */
    constructor(baseUrl: string, authManager: AuthManager) {
        this.baseUrl = baseUrl;
        this.authManager = authManager;

        if (!authManager && !this.hasWarnedAboutNoAuth) {
            console.warn(`Warning: You are using HTTPClient without an AuthManager for base URL ${baseUrl}. This means no authentication will be applied.`);
            this.hasWarnedAboutNoAuth = true;
        }
    }
    /**
     * Performs a GET request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     */
    public GET(endpoint: string, headers?: HeadersInit): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob> {
        return this.request('GET', endpoint, undefined, headers);
    }

    /**
     * Performs a POST request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {any} body - The body of the request.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     */
    public POST(endpoint: string, body: any, headers?: HeadersInit): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob> {
        return this.request('POST', endpoint, body, headers);
    }

    /**
     * Performs a PUT request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {any} body - The body of the request.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     */
    public PUT(endpoint: string, body: any, headers?: HeadersInit): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob> {
        return this.request('PUT', endpoint, body, headers);
    }

    /**
     * Performs a DELETE request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     */
    public DELETE(endpoint: string, headers?: HeadersInit): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob> {
        return this.request('DELETE', endpoint, undefined, headers);
    }

    /**
     * Performs a PATCH request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {any} body - The body of the request.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} - The response in its appropriate type.
     */
    public PATCH(endpoint: string, body: any, headers?: HeadersInit): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob> {
        return this.request('PATCH', endpoint, body, headers);
    }

    /**
     * Performs a HEAD request to retrieve only the headers of a response.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Headers>} - The headers from the response.
     */
    public HEAD(endpoint: string, headers?: HeadersInit): Promise<Headers> {
        return this.headRequest('HEAD', endpoint, headers);
    }

    /**
     * Safely get a header value from HeadersInit.
     * @param {HeadersInit} headers - The headers object.
     * @param {string} key - The header key to retrieve.
     * @returns {string | undefined} - The header value if found, otherwise undefined.
     */
    public getHeader(headers: HeadersInit, key: string): string | undefined {
        if (headers instanceof Headers) {
            const value = headers.get(key);
            return value !== null ? value : undefined;
        } else if (Array.isArray(headers)) {
            const header = headers.find(([k]) => k.toLowerCase() === key.toLowerCase());
            return header ? header[1] : undefined;
        } else if (typeof headers === 'object') {
            return headers[key];
        }
        return undefined;
    }

    /**
     * Safely set a header value in HeadersInit.
     * @param {HeadersInit} headers - The headers object.
     * @param {string} key - The header key to set.
     * @param {string} value - The header value to set.
     */
    public setHeader(headers: HeadersInit, key: string, value: string): void {
        if (headers instanceof Headers) {
            headers.set(key, value);
        } else if (Array.isArray(headers)) {
            const index = headers.findIndex(([k]) => k.toLowerCase() === key.toLowerCase());
            if (index !== -1) {
                headers[index][1] = value;
            } else {
                headers.push([key, value]);
            }
        } else if (typeof headers === 'object') {
            headers[key] = value;
        }
    }

    /**
     * Parses the response based on the Content-Type header and returns the appropriate
     * JavaScript object or data type.
     *
     * @param {Response} response - The fetch API response object.
     * @returns {Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>} The parsed response in its appropriate type.
     * @template Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob>
     */

    async handleContentType(response: Response): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob> {
        const contentType = response.headers.get('Content-Type');
    
        if (!contentType) {
            console.warn('No Content-Type header found in response');
            return await response.text() as string;
        }
    
        switch (true) {
            case contentType.includes('application/json'):
                return await response.json() as Object; // Returns a parsed JSON object or array.
    
            case contentType.includes('text/plain'):
            case contentType.includes('text/html'):
            case contentType.includes('text/csv'):
            case contentType.includes('text/markdown'):
            case contentType.includes('application/x-yaml'):
            case contentType.includes('text/yaml'):
                return await response.text() as string; // Returns a string.
    
            case contentType.includes('application/xml'):
            case contentType.includes('text/xml'):
                const xmlText = await response.text();
                return new window.DOMParser().parseFromString(xmlText, 'application/xml') as XMLDocument; // Returns an XMLDocument.
    
            case contentType.includes('multipart/form-data'):
                return await response.formData() as FormData; // Returns FormData.
    
            case contentType.includes('application/x-www-form-urlencoded'):
                const formText = await response.text();
                return new URLSearchParams(formText) as URLSearchParams; // Returns URLSearchParams.
    
            case contentType.includes('application/octet-stream'):
                return await response.arrayBuffer() as ArrayBuffer; // Returns an ArrayBuffer.
    
            case contentType.includes('application/pdf'):
            case contentType.includes('application/msword'):
            case contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'):
            case contentType.includes('application/vnd.ms-excel'):
            case contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'):
            case contentType.includes('application/vnd.ms-powerpoint'):
            case contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation'):
            case contentType.includes('image/png'):
            case contentType.includes('image/jpeg'):
            case contentType.includes('image/gif'):
            case contentType.includes('image/webp'):
            case contentType.includes('image/bmp'):
            case contentType.includes('image/svg+xml'):
            case contentType.includes('audio/mpeg'):
            case contentType.includes('audio/wav'):
            case contentType.includes('audio/ogg'):
            case contentType.includes('audio/aac'):
            case contentType.includes('audio/flac'):
            case contentType.includes('audio/webm'):
            case contentType.includes('video/mp4'):
            case contentType.includes('video/webm'):
            case contentType.includes('video/ogg'):
            case contentType.includes('video/avi'):
            case contentType.includes('video/mpeg'):
            case contentType.includes('video/quicktime'):
            case contentType.includes('application/zip'):
            case contentType.includes('application/x-7z-compressed'):
            case contentType.includes('application/x-rar-compressed'):
            case contentType.includes('application/x-tar'):
            case contentType.includes('application/gzip'):
            case contentType.includes('application/rtf'):
                return await response.blob() as Blob; // Returns a Blob.
    
            default:
                console.warn(`Unhandled content type: ${contentType}`);
                return await response.text() as string; // Default to string if content type is unrecognized.
        }
    }

    /**
     * Handles HTTP status codes by providing appropriate actions or messages based on the status code.
     *
     * @param {Response} response - The fetch API response object.
     * @returns {Promise<void>} - A promise that resolves if the status code is handled successfully, or rejects with an error if the status code indicates a failure.
     * @throws {Error} - Throws an error for client-side or server-side errors.
     */
    async handleStatusCode(response: Response): Promise<void> {
        const statusCode = response.status;
        const resourceUrl = response.url;
    
        switch (statusCode) {
            // Informational responses (100–199)
            case 100:
                console.info(`100 Continue: The client should continue with its request. Resource: ${resourceUrl}`);
                break;
            case 101:
                console.info(`101 Switching Protocols: The server is switching protocols. Resource: ${resourceUrl}`);
                break;
            case 102:
                console.info(`102 Processing: The server is processing the request, but no response is available yet. Resource: ${resourceUrl}`);
                break;
            case 103:
                console.info(`103 Early Hints: The server is sending some response headers before the final response. Resource: ${resourceUrl}`);
                break;
    
            // Successful responses (200–299)
            case 200:
                console.info(`200 OK: The request has succeeded. Resource: ${resourceUrl}`);
                break;
            case 201:
                console.info(`201 Created: The request has been fulfilled and resulted in a new resource being created. Resource: ${resourceUrl}`);
                break;
            case 202:
                console.info(`202 Accepted: The request has been accepted for processing, but the processing has not been completed. Resource: ${resourceUrl}`);
                break;
            case 203:
                console.info(`203 Non-Authoritative Information: The server is returning information that is not from its origin. Resource: ${resourceUrl}`);
                break;
            case 204:
                console.info(`204 No Content: The server successfully processed the request, but is not returning any content. Resource: ${resourceUrl}`);
                break;
            case 205:
                console.info(`205 Reset Content: The server successfully processed the request, but requires the client to reset the document view. Resource: ${resourceUrl}`);
                break;
            case 206:
                console.info(`206 Partial Content: The server is delivering only part of the resource due to a range header sent by the client. Resource: ${resourceUrl}`);
                break;
            case 207:
                console.info(`207 Multi-Status: The message body contains multiple status codes for different operations. Resource: ${resourceUrl}`);
                break;
            case 208:
                console.info(`208 Already Reported: The members of a DAV binding have already been enumerated. Resource: ${resourceUrl}`);
                break;
            case 226:
                console.info(`226 IM Used: The server has fulfilled the request and the response is a representation of the result of one or more instance-manipulations applied to the current instance. Resource: ${resourceUrl}`);
                break;
    
            // Redirection messages (300–399)
            case 300:
                console.warn(`300 Multiple Choices: The request has more than one possible response. User-agent or user should choose one of them. Resource: ${resourceUrl}`);
                break;
            case 301:
                console.warn(`301 Moved Permanently: The URL of the requested resource has been changed permanently. Resource: ${resourceUrl}`);
                break;
            case 302:
                console.warn(`302 Found: The requested resource has been temporarily moved to a different URI. Resource: ${resourceUrl}`);
                break;
            case 303:
                console.warn(`303 See Other: The server is redirecting to a different URI. Resource: ${resourceUrl}`);
                break;
            case 304:
                console.info(`304 Not Modified: The resource has not been modified since the last request. Resource: ${resourceUrl}`);
                break;
            case 305:
                console.warn(`305 Use Proxy: The requested resource is available only through a proxy. Resource: ${resourceUrl}`);
                break;
            case 307:
                console.warn(`307 Temporary Redirect: The server is redirecting to a different URI, but the request method should not be changed. Resource: ${resourceUrl}`);
                break;
            case 308:
                console.warn(`308 Permanent Redirect: The server is redirecting to a different URI, and the request method should not be changed. Resource: ${resourceUrl}`);
                break;
    
            // Client error responses (400–499)
            case 400:
                console.error(`400 Bad Request: The server could not understand the request due to invalid syntax. Resource: ${resourceUrl}`);
                throw new Error(`400 Bad Request - Resource: ${resourceUrl}`);
            case 401:
                console.error(`401 Unauthorized: The client must authenticate itself to get the requested response. Resource: ${resourceUrl}`);
                throw new Error(`401 Unauthorized - Resource: ${resourceUrl}`);
            case 402:
                console.error(`402 Payment Required: Reserved for future use. Resource: ${resourceUrl}`);
                throw new Error(`402 Payment Required - Resource: ${resourceUrl}`);
            case 403:
                console.error(`403 Forbidden: The client does not have access rights to the content. Resource: ${resourceUrl}`);
                throw new Error(`403 Forbidden - Resource: ${resourceUrl}`);
            case 404:
                console.error(`404 Not Found: The server cannot find the requested resource. Resource: ${resourceUrl}`);
                throw new Error(`404 Not Found - Resource: ${resourceUrl}`);
            case 405:
                console.error(`405 Method Not Allowed: The request method is known by the server but has been disabled and cannot be used. Resource: ${resourceUrl}`);
                throw new Error(`405 Method Not Allowed - Resource: ${resourceUrl}`);
            case 406:
                console.error(`406 Not Acceptable: The server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers. Resource: ${resourceUrl}`);
                throw new Error(`406 Not Acceptable - Resource: ${resourceUrl}`);
            case 407:
                console.error(`407 Proxy Authentication Required: The client must first authenticate itself with the proxy. Resource: ${resourceUrl}`);
                throw new Error(`407 Proxy Authentication Required - Resource: ${resourceUrl}`);
            case 408:
                console.error(`408 Request Timeout: The server would like to shut down this unused connection. Resource: ${resourceUrl}`);
                throw new Error(`408 Request Timeout - Resource: ${resourceUrl}`);
            case 409:
                console.error(`409 Conflict: The request could not be processed because of conflict in the request, such as an edit conflict between multiple simultaneous updates. Resource: ${resourceUrl}`);
                throw new Error(`409 Conflict - Resource: ${resourceUrl}`);
            case 410:
                console.error(`410 Gone: The requested resource is no longer available at the server and no forwarding address is known. Resource: ${resourceUrl}`);
                throw new Error(`410 Gone - Resource: ${resourceUrl}`);
            case 411:
                console.error(`411 Length Required: The server refuses to accept the request without a defined Content-Length. Resource: ${resourceUrl}`);
                throw new Error(`411 Length Required - Resource: ${resourceUrl}`);
            case 412:
                console.error(`412 Precondition Failed: The server does not meet one of the preconditions that the requester put on the request. Resource: ${resourceUrl}`);
                throw new Error(`412 Precondition Failed - Resource: ${resourceUrl}`);
            case 413:
                console.error(`413 Payload Too Large: The request is larger than the server is willing or able to process. Resource: ${resourceUrl}`);
                throw new Error(`413 Payload Too Large - Resource: ${resourceUrl}`);
            case 414:
                console.error(`414 URI Too Long: The URI requested by the client is longer than the server is willing to interpret. Resource: ${resourceUrl}`);
                throw new Error(`414 URI Too Long - Resource: ${resourceUrl}`);
            case 415:
                console.error(`415 Unsupported Media Type: The media format of the requested data is not supported by the server. Resource: ${resourceUrl}`);
                throw new Error(`415 Unsupported Media Type - Resource: ${resourceUrl}`);
            case 416:
                console.error(`416 Range Not Satisfiable: The range specified by the Range header field in the request cannot be fulfilled. Resource: ${resourceUrl}`);
                throw new Error(`416 Range Not Satisfiable - Resource: ${resourceUrl}`);
            case 417:
                console.error(`417 Expectation Failed: The server cannot meet the requirements of the Expect header field. Resource: ${resourceUrl}`);
                throw new Error(`417 Expectation Failed - Resource: ${resourceUrl}`);
            case 418:
                console.error(`418 I'm a teapot: The server refuses the attempt to brew coffee with a teapot. Resource: ${resourceUrl}`);
                throw new Error(`418 I'm a teapot - Resource: ${resourceUrl}`);
            case 421:
                console.error(`421 Misdirected Request: The request was directed at a server that is not able to produce a response. Resource: ${resourceUrl}`);
                throw new Error(`421 Misdirected Request - Resource: ${resourceUrl}`);
            case 422:
                console.error(`422 Unprocessable Entity: The request was well-formed but was unable to be followed due to semantic errors. Resource: ${resourceUrl}`);
                throw new Error(`422 Unprocessable Entity - Resource: ${resourceUrl}`);
            case 423:
                console.error(`423 Locked: The resource that is being accessed is locked. Resource: ${resourceUrl}`);
                throw new Error(`423 Locked - Resource: ${resourceUrl}`);
            case 424:
                console.error(`424 Failed Dependency: The request failed due to failure of a previous request. Resource: ${resourceUrl}`);
                throw new Error(`424 Failed Dependency - Resource: ${resourceUrl}`);
            case 425:
                console.error(`425 Too Early: Indicates that the server is unwilling to risk processing a request that might be replayed. Resource: ${resourceUrl}`);
                throw new Error(`425 Too Early - Resource: ${resourceUrl}`);
            case 426:
                console.error(`426 Upgrade Required: The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol. Resource: ${resourceUrl}`);
                throw new Error(`426 Upgrade Required - Resource: ${resourceUrl}`);
            case 428:
                console.error(`428 Precondition Required: The origin server requires the request to be conditional. Resource: ${resourceUrl}`);
                throw new Error(`428 Precondition Required - Resource: ${resourceUrl}`);
            case 429:
                console.error(`429 Too Many Requests: The user has sent too many requests in a given amount of time. Resource: ${resourceUrl}`);
                throw new Error(`429 Too Many Requests - Resource: ${resourceUrl}`);
            case 431:
                console.error(`431 Request Header Fields Too Large: The server is unwilling to process the request because its header fields are too large. Resource: ${resourceUrl}`);
                throw new Error(`431 Request Header Fields Too Large - Resource: ${resourceUrl}`);
            case 451:
                console.error(`451 Unavailable For Legal Reasons: The user requested a resource that cannot be legally provided, such as a web page censored by a government. Resource: ${resourceUrl}`);
                throw new Error(`451 Unavailable For Legal Reasons - Resource: ${resourceUrl}`);
    
            // Server error responses (500–599)
            case 500:
                console.error(`500 Internal Server Error: The server has encountered a situation it doesn't know how to handle. Resource: ${resourceUrl}`);
                throw new Error(`500 Internal Server Error - Resource: ${resourceUrl}`);
            case 501:
                console.error(`501 Not Implemented: The request method is not supported by the server and cannot be handled. Resource: ${resourceUrl}`);
                throw new Error(`501 Not Implemented - Resource: ${resourceUrl}`);
            case 502:
                console.error(`502 Bad Gateway: The server, while acting as a gateway or proxy, received an invalid response from the upstream server. Resource: ${resourceUrl}`);
                throw new Error(`502 Bad Gateway - Resource: ${resourceUrl}`);
            case 503:
                console.error(`503 Service Unavailable: The server is not ready to handle the request. Resource: ${resourceUrl}`);
                throw new Error(`503 Service Unavailable - Resource: ${resourceUrl}`);
            case 504:
                console.error(`504 Gateway Timeout: The server, while acting as a gateway or proxy, did not get a response in time from the upstream server. Resource: ${resourceUrl}`);
                throw new Error(`504 Gateway Timeout - Resource: ${resourceUrl}`);
            case 505:
                console.error(`505 HTTP Version Not Supported: The HTTP version used in the request is not supported by the server. Resource: ${resourceUrl}`);
                throw new Error(`505 HTTP Version Not Supported - Resource: ${resourceUrl}`);
            case 506:
                console.error(`506 Variant Also Negotiates: The server has an internal configuration error. Resource: ${resourceUrl}`);
                throw new Error(`506 Variant Also Negotiates - Resource: ${resourceUrl}`);
            case 507:
                console.error(`507 Insufficient Storage: The server is unable to store the representation needed to complete the request. Resource: ${resourceUrl}`);
                throw new Error(`507 Insufficient Storage - Resource: ${resourceUrl}`);
            case 508:
                console.error(`508 Loop Detected: The server detected an infinite loop while processing the request. Resource: ${resourceUrl}`);
                throw new Error(`508 Loop Detected - Resource: ${resourceUrl}`);
            case 510:
                console.error(`510 Not Extended: Further extensions to the request are required for the server to fulfill it. Resource: ${resourceUrl}`);
                throw new Error(`510 Not Extended - Resource: ${resourceUrl}`);
            case 511:
                console.error(`511 Network Authentication Required: The client needs to authenticate to gain network access. Resource: ${resourceUrl}`);
                throw new Error(`511 Network Authentication Required - Resource: ${resourceUrl}`);
    
            // Unhandled status codes
            default:
                console.warn(`Unhandled status code: ${statusCode} - ${response.statusText}. Resource: ${resourceUrl}`);
                throw new Error(`Unhandled status code: ${statusCode} - Resource: ${resourceUrl}`);
        }
    }


     /**
     * Handles the request body based on the HTTP method and body type.
     * @param {string} method - The HTTP method (GET, POST, PUT, DELETE, PATCH).
     * @param {any} body - The body of the request.
     * @returns {BodyInit | null} - The processed body suitable for the fetch API or null if no body is needed.
     */
    private handleBody(method: string, body: any): BodyInit | null {
        // RFC 9110 - GET and HEAD requests MUST NOT include a message body
        if (method === 'GET' || method === 'HEAD') {
            return null;
        }

        if (
            body instanceof FormData ||
            body instanceof URLSearchParams ||
            body instanceof Blob ||
            typeof body === 'string' ||
            body instanceof ArrayBuffer
        ) {
            return body;
        } else if (body !== undefined) {
            return JSON.stringify(body);
        }

        return null;
    }

    /**
     * Processes the headers for the request, adding the `Content-Type` header if the body is JSON 
     * and no `Content-Type` is specified. This ensures that the appropriate `Content-Type` is set based on the body type.
     * 
     * @param {HeadersInit} headers - The headers for the request.
     * @param {any} body - The body of the request. Used to determine if a `Content-Type` should be added.
     * @returns {HeadersInit} - The processed headers with any necessary modifications.
     */
    private handleHeaders(headers: HeadersInit, body: any): HeadersInit {
        if (
            body &&
            !(body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob || typeof body === 'string' || body instanceof ArrayBuffer) &&
            !this.getHeader(headers, 'Content-Type')
        ) {
            this.setHeader(headers, 'Content-Type', 'application/json');
        }
        return headers;
    }

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
    private async request<T>(
        method: string,
        endpoint: string,
        body?: any,
        headers: HeadersInit = {}
    ): Promise<Object | string | XMLDocument | FormData | URLSearchParams | ArrayBuffer | Blob> {
        if (this.authManager) {
            headers = this.authManager.applyAuth(headers); // Apply authentication if AuthManager is present
        }

        const url = `${this.baseUrl}${endpoint}`;
        const options: RequestInit = {
            method,
            headers: this.handleHeaders(headers, body),
            body: this.handleBody(method, body)
        };
        this.checkSecurity(headers);

        try {
            console.info(`Starting ${method} request to ${url}`);
            const response = await fetch(url, options);
            await this.handleStatusCode(response);
            return await this.handleContentType(response); // Directly call handleContentType
        } catch (error) {
            console.error(error, `Failed ${method} request to ${url}`);
            throw error; // Rethrow the error after logging it
        }
    }


    /**
     * Handles a HEAD request to retrieve only the headers of a response.
     * @param {string} method - The HTTP method (should be 'HEAD').
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers={}] - The headers for the request.
     * @returns {Promise<Headers>} - The headers from the response.
     * @throws {Error} - Throws an error if the request fails.
     */
    private async headRequest(
        method: string,
        endpoint: string,
        headers: HeadersInit = {}
    ): Promise<Headers> {
        const url = `${this.baseUrl}${endpoint}`;
        const options: RequestInit = {
            method,
            headers: this.handleHeaders(headers, undefined),
        };
        if (this.authManager) {
            headers = this.authManager.applyAuth(headers); // Apply authentication if AuthManager is present
        }
        this.checkSecurity(headers);

        try {
            console.info(`Starting ${method} request to ${url}`);
            const response = await fetch(url, options);
            await this.handleStatusCode(response);
            return response.headers;
        } catch (error) {
            console.error(`Failed ${method} request to ${url}:`, error);
            throw error; // Rethrow the error after logging it
        }
    }

    /**
     * Enforces OWASP security rules, such as avoiding insecure authentication schemes,
     * ensuring API keys and credentials are not passed in URLs or headers in an insecure manner,
     * checking for secure cookie authentication, and enforcing secure protocols.
     * @param {HeadersInit} headers - The headers for the request.
     * @throws {Error} - Throws an error if any OWASP security rules are violated.
     */
    private checkSecurity(headers: HeadersInit): void {
        // Example: Check for insecure authentication schemes
        const authorization = this.getHeader(headers, 'Authorization');
        if (authorization && authorization.startsWith('Basic ')) {
            throw new Error('Insecure authentication scheme detected: Basic Auth is not allowed');
        }

        // Ensure API keys or credentials are not passed in the URL query parameters
        const url = new URL(this.baseUrl);
        const sensitiveParams = ['api_key', 'apikey', 'access_token'];
        for (const param of sensitiveParams) {
            if (url.searchParams.has(param)) {
                throw new Error(`Sensitive information detected in URL query parameters: ${param} must not be passed in the URL`);
            }
        }

        // Ensure API keys or credentials are not passed in headers
        const sensitiveHeaders = ['API-Key', 'Authorization'];
        for (const header of sensitiveHeaders) {
            const headerValue = this.getHeader(headers, header);
            if (headerValue && (headerValue.includes(' ') || headerValue.length > 0)) {
                // This checks for the presence of credentials in headers like 'Authorization: Bearer <token>' or 'API-Key: <key>'
                if (header === 'API-Key') {
                    throw new Error('Sensitive information detected in headers: API keys must not be passed in headers directly');
                } else if (header === 'Authorization' && !headerValue.startsWith('Bearer ')) {
                    throw new Error('Sensitive information detected: Only Bearer tokens should be used in Authorization headers');
                }
            }
        }

        // Ensure the protocol is HTTPS
        if (this.baseUrl.startsWith('http://')) {
            throw new Error('Insecure protocol detected: Use HTTPS instead of HTTP');
        }

        // Allow secure cookie-based authentication with bearer tokens
        if (authorization && authorization.startsWith('Bearer ')) {
            const cookie = this.getHeader(headers, 'Cookie');
            if (!cookie) {
                console.warn('Using bearer tokens with cookies is recommended for added security.');
            } else {
                this.checkCookieSecurity(cookie);
            }
        }
    }

    /**
     * Checks cookie attributes to ensure they follow OWASP guidelines for secure authentication.
     * @param {string} cookie - The cookie header from the request.
     * @throws {Error} - Throws an error if cookie attributes do not meet security requirements.
     */
    private checkCookieSecurity(cookie: string): void {
        const secure = cookie.includes('Secure');
        const httpOnly = cookie.includes('HttpOnly');
        const sameSite = cookie.includes('SameSite');

        if (!secure) {
            throw new Error('Cookies must be set with the Secure attribute.');
        }

        if (!httpOnly) {
            throw new Error('Cookies must be set with the HttpOnly attribute.');
        }

        if (!sameSite) {
            throw new Error('Cookies must be set with the SameSite attribute (Lax or Strict).');
        }
    }
}