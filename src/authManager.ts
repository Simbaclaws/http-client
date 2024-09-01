/**
 * @file AuthManager.ts
 * @description This file contains the AuthManager class, which is responsible for managing 
 * authentication mechanisms such as JWT tokens and secure cookies. The class provides methods 
 * to set and clear JWT tokens, configure secure cookie usage, and apply the appropriate 
 * authentication headers or cookies to HTTP requests.
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

/**
 * The AuthManager class handles authentication for HTTP requests by managing JWT tokens or secure cookies.
 * It allows for in-memory storage of JWT tokens and the application of secure cookies to requests.
 */
export class AuthManager {
    private jwtToken: string | null = null;
    private useSecureCookie: boolean = false;
    private cookieName: string = 'auth_token';

    /**
     * Sets the JWT token for authentication. Stores it in memory.
     * @param {string} token - The JWT token.
     */
    public setJWTToken(token: string): void {
        this.jwtToken = token;
    }

    /**
     * Clears the JWT token from memory.
     */
    public clearJWTToken(): void {
        this.jwtToken = null;
    }

    /**
     * Configures the use of secure cookie authentication.
     * @param {boolean} useSecureCookie - Whether to use secure cookies.
     * @param {string} [cookieName='auth_token'] - The name of the secure cookie.
     */
    public configureSecureCookie(useSecureCookie: boolean, cookieName: string = 'auth_token'): void {
        this.useSecureCookie = useSecureCookie;
        this.cookieName = cookieName;
    }

    /**
     * Retrieves a cookie value by name.
     * @param {string} name - The name of the cookie to retrieve.
     * @returns {string | null} - The cookie value or null if not found.
     */
    private getCookie(name: string): string | null {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    /**
     * Applies the appropriate authentication headers or cookies to the request.
     * @param {HeadersInit} headers - The headers object to apply the authentication to.
     * @returns {HeadersInit} - The headers with the authentication applied.
     */
    public applyAuth(headers: HeadersInit): HeadersInit {
        if (this.jwtToken) {
            if (headers instanceof Headers) {
                headers.set('Authorization', `Bearer ${this.jwtToken}`);
            } else if (Array.isArray(headers)) {
                headers.push(['Authorization', `Bearer ${this.jwtToken}`]);
            } else if (typeof headers === 'object') {
                headers['Authorization'] = `Bearer ${this.jwtToken}`;
            }
        } else if (this.useSecureCookie) {
            const authToken = this.getCookie(this.cookieName);
            if (authToken) {
                // No need to manually set cookies in headers; the browser sends them automatically.
                console.info('Using secure cookies for authentication.');
            }
        }
        return headers;
    }
}