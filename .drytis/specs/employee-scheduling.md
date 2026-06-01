# Employee Scheduling

## Overview
Full employee scheduling system with availability management, time-off requests, shift assignment, and notifications.

## Features

### 1. Employee Availability
- Block specific days of week they can NEVER work (e.g. Sundays)
- Block recurring time ranges per day (e.g. before 2pm on weekdays)
- Set general availability preferences
- Only visible to the employee and managers

### 2. Time-Off Requests
- Request specific dates or date ranges off
- Include reason (optional)
- Status: PENDING → APPROVED / DENIED
- Employees see their own requests; managers see all
- Managers approve/deny with one click

### 3. Shift Scheduling (Managers)
- Weekly schedule view
- Create shifts: date, start time, end time, role/position, assigned employee
- Drag or click to assign
- See conflicts highlighted (employee blocked day, approved time-off, overlapping shifts)
- Copy previous week's schedule
- Publish schedule (triggers notifications)

### 4. Notifications
- When a published schedule includes the employee → notify
- When a shift is changed/removed → notify affected employee
- When time-off request is approved/denied → notify employee
- Uses existing notification system

### 5. Views
- **Employee view**: My Schedule (week), My Availability, My Time-Off Requests
- **Manager view**: Schedule Builder (week), All Requests, All Availability

## Acceptance Criteria
- [ ] DB models: Shift, AvailabilityBlock, TimeOffRequest
- [ ] Employee can set blocked days and hours
- [ ] Employee can submit time-off requests
- [ ] Manager can approve/deny time-off requests
- [ ] Manager can create/edit/delete shifts
- [ ] Manager sees conflict warnings when scheduling against blocked days/approved time-off
- [ ] Schedule changes trigger notifications to affected employees
- [ ] Weekly calendar view for both employee and manager
- [ ] Works on mobile (responsive)