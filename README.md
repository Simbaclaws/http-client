# 📡 HTTP Client
A simple, dependency-free JavaScript wrapper for the Fetch API, designed to streamline HTTP requests. This client provides a clean, class-based interface for common REST methods and handles response parsing automatically based on content types.

##  ✨ Features
* ✨ **Simplified Interface:** A clean, intuitive class-based wrapper around the native Fetch API.
* 📡 **Standard HTTP Methods:** Provides clear methods for GET, POST, PUT, PATCH, DELETE, and HEAD.
* 🔄 **Automatic Content-Type Handling:** Intelligently parses response bodies (JSON, Text, Blob, FormData, etc.) based on the Content-Type header.
* ✍️ **Detailed Status Code Logging:** Logs descriptive messages for all standard HTTP status codes (1xx, 2xx, 3xx, 4xx, 5xx) to the console for easier debugging.
* ⚙️ **Automatic JSON Header:** Automatically sets the Content-Type: application/json header for object-based request bodies.
* 📦 **Zero Dependencies:** Written in plain JavaScript with no external libraries required.

## 🚀 Installation
Since this is a single, dependency-free file, no installation via a package manager is needed.

Simply place the http.js file in your project's source directory (e.g., /src/utils/) and import it into your module.

```javascript
// In your application file (e.g., /src/app.js)
import HTTPClient from './utils/http.js';
```
## 👨‍💻 Usage
Instantiate the HTTPClient with the base URL of the API you want to communicate with. You can then call the request methods on the instance.

Example
```javascript
import HTTPClient from './http.js';

// 1. Initialize the client with your API's base URL
const apiClient = new HTTPClient('https://api.example.com');

// 2. Use the client to make requests
async function fetchUserData(userId) {
  try {
    console.log('Fetching user data...');
    const userData = await apiClient.GET(`/users/${userId}`);
    console.log('User Data:', userData);
    return userData;
  } catch (error) {
    // Errors are already logged by the client, but you can add custom handling
    console.error('Custom error handler: Could not fetch user data.');
    return null;
  }
}

async function createUser(userData) {
  try {
    console.log('Creating new user...');
    const newUser = await apiClient.POST('/users', {
      name: 'Jane Doe',
      email: 'jane.doe@example.com'
    });
    console.log('Created User:', newUser);
    return newUser;
  } catch (error) {
    console.error('Custom error handler: Could not create user.');
    return null;
  }
}
// --- Run examples ---
fetchUserData(1);
createUser();
```

## 📚 API Reference
All methods return a Promise that resolves with the parsed response body. The client automatically logs detailed status messages and errors to the console.

### GET(endpoint, [headers])
Performs a GET request.

### POST(endpoint, body, [headers])
Performs a POST request.

### PUT(endpoint, body, [headers])
Performs a PUT request.

### PATCH(endpoint, body, [headers])
Performs a PATCH request.

### DELETE(endpoint, [headers])
Performs a DELETE request.

### HEAD(endpoint, [headers])
Performs a HEAD request and returns a Promise that resolves with the Headers object.

## 📄 License
This project is licensed under the GPLv3 License.
