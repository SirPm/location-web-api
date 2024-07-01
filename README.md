# location-web-api

# Base Url => https://location-web-api-production.up.railway.app

# Route => `/api/hello`

# Query Params => `?visitor_name="Mark"`

# Sample Request

## Endpoint: `https://location-web-api-production.up.railway.app/api/hello?visitor_name="Mark"`

## Response:
```
    {
    "client_ip": "127.0.0.1", // The IP address of the requester
    "location": "New York" // The city of the requester
    "greeting": "Hello, Mark!, the temperature is 11 degrees Celcius in New York"
    }
```