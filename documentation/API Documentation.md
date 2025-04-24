# Weather Analytics API Documentation

## URL

```
http://domain.com/weather-analytics
```

## 📘 Endpoints Overview
Endpoint to retrieve weather alerts based on various filter criteria.


| Method               |   Endpoint    |                         Description |
|:---------------------|:-------------:|------------------------------------:|
| GET                  |   /reports    |	Retrieve weather reports for cities |
| GET                  |   	/alerts    |        Get triggered weather alerts |
| GET                     |       	/trends        |                                    	View trend analysis for multiple cities |


### Endpoint
```
GET /trends
```

### Query Parameters
- `cities` (required): Array of cities
- `days` (optional): Number of days
### Example Requests

```bash
curl "http://localhost:3008/weather-analytics/trends?cities=Tel%20Aviv&cities=Haifa&days=5"

```

### Response
```json
[
  {
    "cityName": "Tel Aviv",
    "dailyAvgTemp": [
      { "date": "2024-12-01", "avg": 25.2 },
      { "date": "2024-12-02", "avg": 26.1 }
    ]
  },
  {
    "cityName": "Haifa",
    "dailyAvgTemp": [
      { "date": "2024-12-01", "avg": 23.5 },
      { "date": "2024-12-02", "avg": 24.0 }
    ]
  }
]
```

### Notes
- Dates should be provided in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- Query params are case-sensitive
- All responses return 200 OK with JSON or appropriate error messages (400, 404, etc.)

### Endpoint
```
GET /alerts
```

### Query Parameters
- `cityName` (optional): 	Filter by city
- `startDate` (required): Start date (ISO 8601 format)
- `endDate` (required): Start date (ISO 8601 format)
- `type` (optional): Type of alert
### Example Requests

```bash
curl "http://localhost:3008/weather-analytics/alerts?startDate=2024-12-01T00:00:00Z&endDate=2024-12-02T00:00:00Z&type=highTemperature"

```

### Response
```json
[
  [
    {
      "cityName": "Haifa",
      "alertType": "highTemperature",
      "timestamp": "2024-12-01T13:30:00Z"
    }
  ]
]
```

### Notes
- Dates should be provided in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- Query params are case-sensitive
- All responses return 200 OK with JSON or appropriate error messages (400, 404, etc.)
