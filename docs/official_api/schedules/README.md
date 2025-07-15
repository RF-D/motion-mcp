# Schedules API

The Schedules API provides access to work hour configurations that Motion uses for task scheduling.

## Overview

Schedules define:
- Working hours for each day of the week
- Time zones for scheduling
- Availability windows for task scheduling
- Default work patterns

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/schedules` | [Get all schedules](./get-schedules.md) |

## Schedule Object

```javascript
{
  name: string,              // Schedule name (e.g., "Work Hours")
  isDefaultTimezone: boolean, // Whether using default timezone
  timezone: string,          // Timezone identifier (e.g., "America/New_York")
  schedule: {
    monday: [
      { start: "HH:MM", end: "HH:MM" }
    ],
    tuesday: [
      { start: "HH:MM", end: "HH:MM" }
    ],
    wednesday: [
      { start: "HH:MM", end: "HH:MM" }
    ],
    thursday: [
      { start: "HH:MM", end: "HH:MM" }
    ],
    friday: [
      { start: "HH:MM", end: "HH:MM" }
    ],
    saturday: [
      { start: "HH:MM", end: "HH:MM" }
    ],
    sunday: [
      { start: "HH:MM", end: "HH:MM" }
    ]
  }
}
```

## Common Use Cases

### Standard Work Week

Most users have a standard Monday-Friday schedule:
```javascript
{
  name: "Work Hours",
  timezone: "America/New_York",
  schedule: {
    monday: [{ start: "09:00", end: "17:00" }],
    tuesday: [{ start: "09:00", end: "17:00" }],
    wednesday: [{ start: "09:00", end: "17:00" }],
    thursday: [{ start: "09:00", end: "17:00" }],
    friday: [{ start: "09:00", end: "17:00" }],
    saturday: [],
    sunday: []
  }
}
```

### Split Schedule

Some users have split schedules with breaks:
```javascript
{
  name: "Work Hours",
  timezone: "Europe/London",
  schedule: {
    monday: [
      { start: "09:00", end: "12:00" },
      { start: "13:00", end: "17:00" }
    ],
    // ... other days
  }
}
```

## How Motion Uses Schedules

1. **Task Scheduling**: Motion only schedules tasks during defined work hours
2. **Auto-Scheduling**: The AI respects schedule boundaries when placing tasks
3. **Time Zone Handling**: All scheduling respects the schedule's timezone
4. **Buffer Time**: Motion may include buffer time around schedule boundaries

## Important Notes

- Schedules are read-only via the API
- Each user typically has one primary schedule
- "Work Hours" is the default schedule name
- Schedule modifications must be done through the Motion app
- Time formats use 24-hour notation (HH:MM)

## Related Resources

- [Tasks API](../tasks/) - Tasks are scheduled within these hours
- [Recurring Tasks API](../recurring-tasks/) - Recurring tasks respect schedules