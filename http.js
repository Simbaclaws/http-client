/**
 * @file httpClient.js
 * @description This library is a simple wrapper around the Fetch API, adhering to RFC 9110 standards.
 *
 * @version 1.0.0
 * @license GPLv3
 * @author Hylke Hellinga
 */

/**
 * The HTTPClient class is a wrapper around the Fetch API, providing methods for
 * making HTTP requests. It supports GET, POST, PUT, DELETE, PATCH, and HEAD
 * methods, while also managing request headers, body, and response handling.
 */
export default class HTTPClient {
    baseUrl;

    /**
     * Initializes the HTTPClient with a base URL.
     * @param {string} baseUrl - The base URL for all requests.
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Performs a GET request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<*>} The response in its appropriate type.
     */
    GET(endpoint, headers) {
        return this.request('GET', endpoint, undefined, headers);
    }

    /**
     * Performs a POST request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {*} body - The body of the request.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<*>} The response in its appropriate type.
     */
    POST(endpoint, body, headers) {
        return this.request('POST', endpoint, body, headers);
    }

    /**
     * Performs a PUT request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {*} body - The body of the request.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<*>} The response in its appropriate type.
     */
    PUT(endpoint, body, headers) {
        return this.request('PUT', endpoint, body, headers);
    }

    /**
     * Performs a DELETE request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<*>} The response in its appropriate type.
     */
    DELETE(endpoint, headers) {
        return this.request('DELETE', endpoint, undefined, headers);
    }

    /**
     * Performs a PATCH request.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {*} body - The body of the request.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<*>} The response in its appropriate type.
     */
    PATCH(endpoint, body, headers) {
        return this.request('PATCH', endpoint, body, headers);
    }

    /**
     * Performs a HEAD request to retrieve only the headers of a response.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers] - Optional headers for the request.
     * @returns {Promise<Headers>} The headers from the response.
     */
    HEAD(endpoint, headers) {
        return this.headRequest('HEAD', endpoint, headers);
    }

    /**
     * Safely gets a header value from a HeadersInit object.
     * @param {HeadersInit} headers - The headers object.
     * @param {string} key - The case-insensitive header key to retrieve.
     * @returns {string | undefined} The header value if found, otherwise undefined.
     */
    getHeader(headers, key) {
        if (headers instanceof Headers) {
            const value = headers.get(key);
            return value !== null ? value : undefined;
        } else if (Array.isArray(headers)) {
            const header = headers.find(([k]) => k.toLowerCase() === key.toLowerCase());
            return header ? header[1] : undefined;
        } else if (typeof headers === 'object' && headers !== null) {
            const headerKey = Object.keys(headers).find(k => k.toLowerCase() === key.toLowerCase());
            return headerKey ? headers[headerKey] : undefined;
        }
        return undefined;
    }

    /**
     * Safely sets a header value in a HeadersInit object.
     * @param {HeadersInit} headers - The headers object.
     * @param {string} key - The header key to set.
     * @param {string} value - The header value to set.
     */
    setHeader(headers, key, value) {
        if (headers instanceof Headers) {
            headers.set(key, value);
        } else if (Array.isArray(headers)) {
            const index = headers.findIndex(([k]) => k.toLowerCase() === key.toLowerCase());
            if (index !== -1) {
                headers[index][1] = value;
            } else {
                headers.push([key, value]);
            }
        } else if (typeof headers === 'object' && headers !== null) {
            headers[key] = value;
        }
    }

    /**
     * Parses the response based on its Content-Type header.
     * @param {Response} response - The fetch API Response object.
     * @returns {Promise<*>} The parsed response in its appropriate type.
     */
    async handleContentType(response) {
        const contentType = response.headers.get('Content-Type');

        if (!contentType) {
            console.warn('No Content-Type header found in response');
            return await response.text();
        }

        switch (true) {
            // JSON data
            case contentType.includes('application/json'):
                return await response.json();

            // Plain text and text-based formats
            case contentType.includes('text/plain'):
            case contentType.includes('text/html'):
            case contentType.includes('text/csv'):
            case contentType.includes('text/markdown'):
            case contentType.includes('application/x-yaml'):
            case contentType.includes('text/yaml'):
                return await response.text();

            // XML data
            case contentType.includes('application/xml'):
            case contentType.includes('text/xml'):
                const xmlText = await response.text();
                return new window.DOMParser().parseFromString(xmlText, 'application/xml');

            // Form data
            case contentType.includes('multipart/form-data'):
                return await response.formData();

            // URL-encoded form data
            case contentType.includes('application/x-www-form-urlencoded'):
                const formText = await response.text();
                return new URLSearchParams(formText);

            // Raw binary data as an ArrayBuffer
            case contentType.includes('application/octet-stream'):
                return await response.arrayBuffer();

            // Office Documents & PDFs
            case contentType.includes('application/pdf'):
            case contentType.includes('application/rtf'):
            case contentType.includes('application/msword'):
            case contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'):
            case contentType.includes('application/vnd.ms-excel'):
            case contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'):
            case contentType.includes('application/vnd.ms-powerpoint'):
            case contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation'):
            // Images
            case contentType.includes('image/png'):
            case contentType.includes('image/jpeg'):
            case contentType.includes('image/gif'):
            case contentType.includes('image/webp'):
            case contentType.includes('image/bmp'):
            case contentType.includes('image/svg+xml'):
            // Audio
            case contentType.includes('audio/mpeg'):
            case contentType.includes('audio/wav'):
            case contentType.includes('audio/ogg'):
            case contentType.includes('audio/aac'):
            case contentType.includes('audio/flac'):
            case contentType.includes('audio/webm'):
            // Video
            case contentType.includes('video/mp4'):
            case contentType.includes('video/webm'):
            case contentType.includes('video/ogg'):
            case contentType.includes('video/avi'):
            case contentType.includes('video/mpeg'):
            case contentType.includes('video/quicktime'):
            // Archives
            case contentType.includes('application/zip'):
            case contentType.includes('application/x-7z-compressed'):
            case contentType.includes('application/x-rar-compressed'):
            case contentType.includes('application/x-tar'):
            case contentType.includes('application/gzip'):
                return await response.blob();

            // Default fallback
            default:
                console.warn(`Unhandled content type: ${contentType}`);
                return await response.text();
        }
    }

    /**
     * Handles HTTP status codes by logging appropriate messages.
     * @param {Response} response - The fetch API Response object.
     * @throws {Error} - Throws an error for unhandled status codes.
     */
    async handleStatusCode(response) {
        const statusCode = response.status;
        const resourceUrl = response.url;

        switch (statusCode) {
            // Informational responses (100–199)
            case 100: console.info(`100 Continue: The client should continue with its request. Resource: ${resourceUrl}`); break;
            case 101: console.info(`101 Switching Protocols: The server is switching protocols. Resource: ${resourceUrl}`); break;
            case 102: console.info(`102 Processing: The server is processing the request, but no response is available yet. Resource: ${resourceUrl}`); break;
            case 103: console.info(`103 Early Hints: The server is sending some response headers before the final response. Resource: ${resourceUrl}`); break;

            // Successful responses (200–299)
            case 200: console.info(`200 OK: The request has succeeded. Resource: ${resourceUrl}`); break;
            case 201: console.info(`201 Created: The request has been fulfilled and resulted in a new resource being created. Resource: ${resourceUrl}`); break;
            case 202: console.info(`202 Accepted: The request has been accepted for processing, but the processing has not been completed. Resource: ${resourceUrl}`); break;
            case 203: console.info(`203 Non-Authoritative Information: The server is returning information that is not from its origin. Resource: ${resourceUrl}`); break;
            case 204: console.info(`204 No Content: The server successfully processed the request, but is not returning any content. Resource: ${resourceUrl}`); break;
            case 205: console.info(`205 Reset Content: The server successfully processed the request, but requires the client to reset the document view. Resource: ${resourceUrl}`); break;
            case 206: console.info(`206 Partial Content: The server is delivering only part of the resource due to a range header sent by the client. Resource: ${resourceUrl}`); break;
            case 207: console.info(`207 Multi-Status: The message body contains multiple status codes for different operations. Resource: ${resourceUrl}`); break;
            case 208: console.info(`208 Already Reported: The members of a DAV binding have already been enumerated. Resource: ${resourceUrl}`); break;
            case 226: console.info(`226 IM Used: The server has fulfilled the request and the response is a representation of the result of one or more instance-manipulations applied to the current instance. Resource: ${resourceUrl}`); break;

            // Redirection messages (300–399)
            case 300: console.warn(`300 Multiple Choices: The request has more than one possible response. User-agent or user should choose one of them. Resource: ${resourceUrl}`); break;
            case 301: console.warn(`301 Moved Permanently: The URL of the requested resource has been changed permanently. Resource: ${resourceUrl}`); break;
            case 302: console.warn(`302 Found: The requested resource has been temporarily moved to a different URI. Resource: ${resourceUrl}`); break;
            case 303: console.warn(`303 See Other: The server is redirecting to a different URI. Resource: ${resourceUrl}`); break;
            case 304: console.info(`304 Not Modified: The resource has not been modified since the last request. Resource: ${resourceUrl}`); break;
            case 305: console.warn(`305 Use Proxy: The requested resource is available only through a proxy. Resource: ${resourceUrl}`); break;
            case 307: console.warn(`307 Temporary Redirect: The server is redirecting to a different URI, but the request method should not be changed. Resource: ${resourceUrl}`); break;
            case 308: console.warn(`308 Permanent Redirect: The server is redirecting to a different URI, and the request method should not be changed. Resource: ${resourceUrl}`); break;

            // Client error responses (400–499)
            case 400: console.error(`400 Bad Request: The server could not understand the request due to invalid syntax. Resource: ${resourceUrl}`); break;
            case 401: console.error(`401 Unauthorized: The client must authenticate itself to get the requested response. Resource: ${resourceUrl}`); break;
            case 402: console.error(`402 Payment Required: Reserved for future use. Resource: ${resourceUrl}`); break;
            case 403: console.error(`403 Forbidden: The client does not have access rights to the content. Resource: ${resourceUrl}`); break;
            case 404: console.error(`404 Not Found: The server cannot find the requested resource. Resource: ${resourceUrl}`); break;
            case 405: console.error(`405 Method Not Allowed: The request method is known by the server but has been disabled and cannot be used. Resource: ${resourceUrl}`); break;
            case 406: console.error(`406 Not Acceptable: The server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers. Resource: ${resourceUrl}`); break;
            case 407: console.error(`407 Proxy Authentication Required: The client must first authenticate itself with the proxy. Resource: ${resourceUrl}`); break;
            case 408: console.error(`408 Request Timeout: The server would like to shut down this unused connection. Resource: ${resourceUrl}`); break;
            case 409: console.error(`409 Conflict: The request could not be processed because of conflict in the request, such as an edit conflict between multiple simultaneous updates. Resource: ${resourceUrl}`); break;
            case 410: console.error(`410 Gone: The requested resource is no longer available at the server and no forwarding address is known. Resource: ${resourceUrl}`); break;
            case 411: console.error(`411 Length Required: The server refuses to accept the request without a defined Content-Length. Resource: ${resourceUrl}`); break;
            case 412: console.error(`412 Precondition Failed: The server does not meet one of the preconditions that the requester put on the request. Resource: ${resourceUrl}`); break;
            case 413: console.error(`413 Payload Too Large: The request is larger than the server is willing or able to process. Resource: ${resourceUrl}`); break;
            case 414: console.error(`414 URI Too Long: The URI requested by the client is longer than the server is willing to interpret. Resource: ${resourceUrl}`); break;
            case 415: console.error(`415 Unsupported Media Type: The media format of the requested data is not supported by the server. Resource: ${resourceUrl}`); break;
            case 416: console.error(`416 Range Not Satisfiable: The range specified by the Range header field in the request cannot be fulfilled. Resource: ${resourceUrl}`); break;
            case 417: console.error(`417 Expectation Failed: The server cannot meet the requirements of the Expect header field. Resource: ${resourceUrl}`); break;
            case 418: console.error(`418 I'm a teapot: The server refuses the attempt to brew coffee with a teapot. Resource: ${resourceUrl}`); break;
            case 421: console.error(`421 Misdirected Request: The request was directed at a server that is not able to produce a response. Resource: ${resourceUrl}`); break;
            case 422: console.error(`422 Unprocessable Entity: The request was well-formed but was unable to be followed due to semantic errors. Resource: ${resourceUrl}`); break;
            case 423: console.error(`423 Locked: The resource that is being accessed is locked. Resource: ${resourceUrl}`); break;
            case 424: console.error(`424 Failed Dependency: The request failed due to failure of a previous request. Resource: ${resourceUrl}`); break;
            case 425: console.error(`425 Too Early: Indicates that the server is unwilling to risk processing a request that might be replayed. Resource: ${resourceUrl}`); break;
            case 426: console.error(`426 Upgrade Required: The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol. Resource: ${resourceUrl}`); break;
            case 428: console.error(`428 Precondition Required: The origin server requires the request to be conditional. Resource: ${resourceUrl}`); break;
            case 429: console.error(`429 Too Many Requests: The user has sent too many requests in a given amount of time. Resource: ${resourceUrl}`); break;
            case 431: console.error(`431 Request Header Fields Too Large: The server is unwilling to process the request because its header fields are too large. Resource: ${resourceUrl}`); break;
            case 451: console.error(`451 Unavailable For Legal Reasons: The user requested a resource that cannot be legally provided, such as a web page censored by a government. Resource: ${resourceUrl}`); break;

            // Server error responses (500–599)
            case 500: console.error(`500 Internal Server Error: The server has encountered a situation it doesn't know how to handle. Resource: ${resourceUrl}`); break;
            case 501: console.error(`501 Not Implemented: The request method is not supported by the server and cannot be handled. Resource: ${resourceUrl}`); break;
            case 502: console.error(`502 Bad Gateway: The server, while acting as a gateway or proxy, received an invalid response from the upstream server. Resource: ${resourceUrl}`); break;
            case 503: console.error(`503 Service Unavailable: The server is not ready to handle the request. Resource: ${resourceUrl}`); break;
            case 504: console.error(`504 Gateway Timeout: The server, while acting as a gateway or proxy, did not get a response in time from the upstream server. Resource: ${resourceUrl}`); break;
            case 505: console.error(`505 HTTP Version Not Supported: The HTTP version used in the request is not supported by the server. Resource: ${resourceUrl}`); break;
            case 506: console.error(`506 Variant Also Negotiates: The server has an internal configuration error. Resource: ${resourceUrl}`); break;
            case 507: console.error(`507 Insufficient Storage: The server is unable to store the representation needed to complete the request. Resource: ${resourceUrl}`); break;
            case 508: console.error(`508 Loop Detected: The server detected an infinite loop while processing the request. Resource: ${resourceUrl}`); break;
            case 510: console.error(`510 Not Extended: Further extensions to the request are required for the server to fulfill it. Resource: ${resourceUrl}`); break;
            case 511: console.error(`511 Network Authentication Required: The client needs to authenticate to gain network access. Resource: ${resourceUrl}`); break;

            // Unhandled status codes
            default:
                console.warn(`Unhandled status code: ${statusCode} - ${response.statusText}. Resource: ${resourceUrl}`);
                throw new Error(`Unhandled status code: ${statusCode} - Resource: ${resourceUrl}`);
        }
    }


    /**
     * Prepares the body for the fetch request based on its type and the HTTP method.
     * @param {string} method - The HTTP method (e.g., 'GET', 'POST').
     * @param {*} body - The request body.
     * @returns {BodyInit | null} The processed body suitable for the fetch API, or null.
     */
    handleBody(method, body) {
        if (method === 'GET' || method === 'HEAD') {
            return null;
        }
        if (body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob || typeof body === 'string' || body instanceof ArrayBuffer) {
            return body;
        } else if (body !== undefined && body !== null) {
            return JSON.stringify(body);
        }
        return null;
    }

    /**
     * Prepares the headers for the fetch request.
     * @description Sets 'Content-Type' to 'application/json' if not already set and the body is a JSON object.
     * @param {HeadersInit} headers - The initial headers for the request.
     * @param {*} body - The request body, used to determine if the JSON header is needed.
     * @returns {HeadersInit} The processed headers.
     */
    handleHeaders(headers, body) {
        if (body && !(body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob || typeof body === 'string' || body instanceof ArrayBuffer) && !this.getHeader(headers, 'Content-Type')) {
            this.setHeader(headers, 'Content-Type', 'application/json');
        }
        return headers;
    }

    /**
     * The core request method that constructs and executes the fetch call.
     * @param {string} method - The HTTP method.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {*} [body] - The body of the request.
     * @param {HeadersInit} [headers={}] - The headers for the request.
     * @returns {Promise<*>} The processed response data.
     * @throws {Error} Throws an error if the fetch call fails or is unhandled.
     */
    async request(method, endpoint, body, headers = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: this.handleHeaders(headers, body),
            body: this.handleBody(method, body)
        };

        try {
            console.info(`Starting ${method} request to ${url}`);
            const response = await fetch(url, options);
            await this.handleStatusCode(response);
            if (response.status === 204) {
                return;
            }
            return this.handleContentType(response);
        } catch (error) {
            console.error(`Failed ${method} request to ${url}: ${error.message}`);
            throw error;
        }
    }

    /**
     * The core request method for HEAD requests.
     * @param {string} method - The HTTP method (should be 'HEAD').
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {HeadersInit} [headers={}] - The headers for the request.
     * @returns {Promise<Headers>} The headers from the response.
     * @throws {Error} Throws an error if the fetch call fails or is unhandled.
     */
    async headRequest(method, endpoint, headers = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: this.handleHeaders(headers, undefined),
        };

        try {
            console.info(`Starting ${method} request to ${url}`);
            const response = await fetch(url, options);
            await this.handleStatusCode(response);
            return response.headers;
        } catch (error) {
            console.error(`Failed ${method} request to ${url}: ${error.message}`);
            throw error;
        }
    }
}
