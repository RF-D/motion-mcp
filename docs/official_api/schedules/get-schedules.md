# Get Schedules

Retrieve all available work schedules for the current user.

## Endpoint

```
GET /v1/schedules
```

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X GET https://api.usemotion.com/v1/schedules \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

Returns an array of schedule objects:

```json
[
  {
    "name": "Work Hours",
    "isDefaultTimezone": false,
    "timezone": "America/New_York",
    "schedule": {
      "monday": [
        { "start": "09:00", "end": "17:00" }
      ],
      "tuesday": [
        { "start": "09:00", "end": "17:00" }
      ],
      "wednesday": [
        { "start": "09:00", "end": "17:00" }
      ],
      "thursday": [
        { "start": "09:00", "end": "17:00" }
      ],
      "friday": [
        { "start": "09:00", "end": "17:00" }
      ],
      "saturday": [],
      "sunday": []
    }
  },
  {
    "name": "Weekend Schedule",
    "isDefaultTimezone": false,
    "timezone": "America/New_York",
    "schedule": {
      "monday": [],
      "tuesday": [],
      "wednesday": [],
      "thursday": [],
      "friday": [],
      "saturday": [
        { "start": "10:00", "end": "14:00" }
      ],
      "sunday": [
        { "start": "10:00", "end": "14:00" }
      ]
    }
  }
]
```

### Split Schedule Example

```json
[
  {
    "name": "Work Hours",
    "isDefaultTimezone": false,
    "timezone": "Europe/London",
    "schedule": {
      "monday": [
        { "start": "09:00", "end": "12:30" },
        { "start": "13:30", "end": "18:00" }
      ],
      "tuesday": [
        { "start": "09:00", "end": "12:30" },
        { "start": "13:30", "end": "18:00" }
      ],
      "wednesday": [
        { "start": "09:00", "end": "12:30" },
        { "start": "13:30", "end": "18:00" }
      ],
      "thursday": [
        { "start": "09:00", "end": "12:30" },
        { "start": "13:30", "end": "18:00" }
      ],
      "friday": [
        { "start": "09:00", "end": "12:30" },
        { "start": "13:30", "end: "17:00" }
      ],
      "saturday": [],
      "sunday": []
    }
  }
]
```

### Error Responses

#### 401 Unauthorized

Invalid or missing API key:

```json
{
  "error": {
    "message": "Invalid API key",
    "code": "INVALID_API_KEY"
  }
}
```

## Code Examples

### JavaScript

```javascript
async function getSchedules() {
  const response = await fetch(
    'https://api.usemotion.com/v1/schedules',
    {
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get schedules: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
try {
  const schedules = await getSchedules();
  
  schedules.forEach(schedule => {
    console.log(`\nSchedule: ${schedule.name}`);
    console.log(`Timezone: ${schedule.timezone}`);
    
    Object.entries(schedule.schedule).forEach(([day, hours]) => {
      if (hours.length > 0) {
        const times = hours.map(h => `${h.start}-${h.end}`).join(', ');
        console.log(`  ${day}: ${times}`);
      }
    });
  });
} catch (error) {
  console.error('Error:', error);
}
```

### Python

```python
import requests
import os

def get_schedules():
    url = "https://api.usemotion.com/v1/schedules"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    schedules = get_schedules()
    
    for schedule in schedules:
        print(f"\nSchedule: {schedule['name']}")
        print(f"Timezone: {schedule['timezone']}")
        
        for day, hours in schedule['schedule'].items():
            if hours:
                times = ', '.join([f"{h['start']}-{h['end']}" for h in hours])
                print(f"  {day}: {times}")
                
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Calculate Total Work Hours

```javascript
function calculateWeeklyHours(schedule) {
  let totalMinutes = 0;
  
  Object.values(schedule.schedule).forEach(dayHours => {
    dayHours.forEach(period => {
      const start = period.start.split(':').map(Number);
      const end = period.end.split(':').map(Number);
      
      const startMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];
      
      totalMinutes += endMinutes - startMinutes;
    });
  });
  
  return totalMinutes / 60;
}

// Calculate total work hours per week
const schedules = await getSchedules();
const workSchedule = schedules.find(s => s.name === 'Work Hours');

if (workSchedule) {
  const weeklyHours = calculateWeeklyHours(workSchedule);
  console.log(`Total work hours per week: ${weeklyHours}`);
}
```

### Get Schedule for Specific Day

```javascript
function getScheduleForDay(schedule, dayName) {
  const day = dayName.toLowerCase();
  const hours = schedule.schedule[day] || [];
  
  if (hours.length === 0) {
    return { isWorkDay: false, hours: [] };
  }
  
  return {
    isWorkDay: true,
    hours: hours,
    totalHours: hours.reduce((total, period) => {
      const [startH, startM] = period.start.split(':').map(Number);
      const [endH, endM] = period.end.split(':').map(Number);
      return total + (endH - startH) + (endM - startM) / 60;
    }, 0)
  };
}

// Check if today is a work day
const schedules = await getSchedules();
const workSchedule = schedules.find(s => s.name === 'Work Hours');
const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

const todaySchedule = getScheduleForDay(workSchedule, today);
if (todaySchedule.isWorkDay) {
  console.log(`Today's work hours: ${todaySchedule.hours.map(h => `${h.start}-${h.end}`).join(', ')}`);
  console.log(`Total hours: ${todaySchedule.totalHours}`);
} else {
  console.log('No work scheduled for today');
}
```

### Check Current Availability

```javascript
function isCurrentlyWorking(schedule) {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const daySchedule = schedule.schedule[dayName] || [];
  
  return daySchedule.some(period => {
    return currentTime >= period.start && currentTime <= period.end;
  });
}

// Check if currently in work hours
const schedules = await getSchedules();
const workSchedule = schedules.find(s => s.name === 'Work Hours');

if (workSchedule) {
  const working = isCurrentlyWorking(workSchedule);
  console.log(working ? 'Currently in work hours' : 'Outside work hours');
}
```

## Response Fields

### Schedule Object

- **name**: Display name of the schedule (e.g., "Work Hours")
- **isDefaultTimezone**: Whether using system default timezone
- **timezone**: IANA timezone identifier (e.g., "America/New_York")
- **schedule**: Object with days as keys

### Day Schedule

Each day (monday through sunday) contains an array of time periods:
- **start**: Start time in 24-hour format (HH:MM)
- **end**: End time in 24-hour format (HH:MM)

Empty array indicates no work scheduled for that day.

## Notes

- Schedules are read-only via API
- Multiple schedules may be returned if user has different schedules configured
- Time periods within a day should not overlap
- All times are in the schedule's specified timezone
- The primary schedule is typically named "Work Hours"