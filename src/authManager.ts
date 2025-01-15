/**
 * @file AuthManager.ts
 * @description This file contains the AuthManager class, which is responsible for managing 
 * authentication mechanisms such as JWT tokens. The class provides methods 
 * to set and clear JWT tokens, and apply the appropriate 
 * authentication headers to HTTPS requests.
 * 
 * WARNING: I'm not a security expert, don't rely on it in production if it's vital to your organization's needs.
 * This is provided AS IS, don't make assumptions about the source code without doing a proper security audit before using it in production!
 * 
 * If a well-known established security auditor wants to help improve this code, please submit a pull request and let me know of any vulnerabilities/wrong implementations in code.
 *
 * @version 1.0.0
 * @license GPL
 * @author Hylke Hellinga
 */

/**
 * The AuthManager class handles authentication for HTTP requests by managing JWT tokens or secure cookies.
 * It allows for in-memory storage of JWT tokens and the application of secure cookies to requests.
 */
export class AuthManager {
    private jwtToken: string | null = null;

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
        }
        return headers;
    }
}