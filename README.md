# HTTPClient Library

This project is a simple HTTP client library built on top of the Fetch API in TypeScript. It is designed to make HTTP requests with support for various HTTP methods, while adhering to security best practices including OWASP guidelines and RFC 9110.

## ⚠️ Warning

**WARNING**: I'm not a security expert, and this library should not be relied upon in production if security is critical to your organization's needs. This code is provided **AS IS**, and you should not make any assumptions about its security or reliability without performing a thorough security audit before using it in production.

If you are a well-known and established security auditor or expert and would like to help improve this code, please feel free to submit a pull request. I'm open to any feedback regarding potential vulnerabilities or incorrect implementations.

**DISCLAIMER**: Some of this code is AI generated, with human intervention.

---

## Features

- Supports HTTP methods: GET, POST, PUT, DELETE, PATCH, and HEAD.
- Optional integration with an `AuthManager` for JWT tokens or secure cookie authentication.
- Handles HTTP status codes with appropriate logging and error handling.
- Parses responses based on `Content-Type` headers into appropriate JavaScript types.
- Logs warnings when security best practices are not followed (e.g., using HTTP instead of HTTPS, missing authentication).

## Installation

To install the library, run:

```bash
npm install git+https://github.com/Simbaclaws/http-client-lib.git
```

## Basic Example

If your API does not require authentication, you can instantiate the HTTPClient without providing an AuthManager.

```typescript
import HTTPClient from 'http-client-lib';

const baseUrl = 'https://your-api.com';
const client = new HTTPClient(baseUrl);

async function fetchData() {
    try {
        const response = await client.GET('/public-endpoint');
        console.log(response);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchData();
```

## Setting a JWT Token

To use JWT authentication, you need to set the JWT token in the AuthManager and pass the AuthManager instance to the HTTPClient.

```typescript
import HTTPClient from 'http-client-lib';
import { AuthManager } from 'http-client-lib';

// Initialize the AuthManager with the JWT token
const authManager = new AuthManager();
authManager.setJWTToken('your-jwt-token-here');

// Initialize the HTTPClient with the base URL and AuthManager
const client = new HTTPClient('https://your-api.com', authManager);

// Example function to make an authenticated request
async function fetchData() {
    try {
        const response = await client.GET('/secure-endpoint');
        console.log(response);
    } catch (error) {
        console.error('Error fetching secure data:', error);
    }
}

fetchData();
```

## Using Secure Cookie Authentication

If your application relies on secure cookies for authentication, you can configure the AuthManager to handle this.

```typescript
import HTTPClient from 'http-client-lib';
import { AuthManager } from 'http-client-lib';

// Initialize the AuthManager to use secure cookies
const authManager = new AuthManager();
authManager.configureSecureCookie(true, 'your-cookie-name');

// Initialize the HTTPClient with the base URL and AuthManager
const client = new HTTPClient('https://your-api.com', authManager);

// Example function to make an authenticated request using cookies
async function fetchData() {
    try {
        const response = await client.GET('/secure-endpoint');
        console.log(response);
    } catch (error) {
        console.error('Error fetching secure data:', error);
    }
}

fetchData();
```

## License

This project is licensed under the GNU General Public License v3.0. See the LICENSE file for details.

