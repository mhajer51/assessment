# Taxi Trips Cancellation Rate – Solutions

##### The solution was implemented using Laravel 12 with React for the frontend.
##### I chose not to use the ORM in the reporting layer, as the task is aggregation-heavy and better suited for direct database queries for clarity and performance.
##### The Vite configuration was adjusted to support HMR in a Docker-based local environment, with the host set to assessment.local to match the domain used in the browser.
##### The application environment was also updated by setting APP_URL=http://assessment.local to ensure correct URL resolution in the local setup.

## Part A – SQL / Database

### Q1 – Cancellation Rate per Day (Core)

```sql
SELECT
  t.request_at AS Day,
  ROUND(
    SUM(CASE
          WHEN t.status IN ('cancelled_by_driver', 'cancelled_by_client') THEN 1
          ELSE 0
        END) / COUNT(*),
    2
  ) AS "Cancellation Rate"
FROM Trips AS t
JOIN Users AS c
  ON c.users_id = t.client_id
 AND c.banned = 'No'
JOIN Users AS d
  ON d.users_id = t.driver_id
 AND d.banned = 'No'
WHERE t.request_at BETWEEN '2013-10-01' AND '2013-10-03'
GROUP BY t.request_at
HAVING COUNT(*) > 0
ORDER BY t.request_at;
```

### Q2 – Data Modeling / Indexing

**Indexes to add**

* `Trips(request_at)` to speed up the date range filter.
* `Trips(client_id)` and `Trips(driver_id)` (or a composite like
  `Trips(request_at, client_id, driver_id)`) to speed up joins and filtering
  by date simultaneously.
* `Users(users_id, banned)` (or keep `users_id` as PK and add a separate
  `Users(banned)` if needed) to make the banned filter efficient when joined
  from trips.

**request_at type**

Use a `DATE` (or `DATETIME`/`TIMESTAMP` if time-of-day matters) column instead
of `VARCHAR`. Native date types are more compact, validate input, allow date
arithmetic, and index/range queries are more efficient and reliable.

## Part B – Algorithm / Coding

### Q3 – Function to Compute Daily Cancellation Rate

```javascript
function cancellationRates(users, trips, startDate, endDate) {
  const userStatus = new Map();
  for (const user of users) {
    userStatus.set(user.id, user.banned);
  }

  const totalsByDay = new Map();
  const cancelledByDay = new Map();

  for (const trip of trips) {
    if (trip.request_at < startDate || trip.request_at > endDate) {
      continue;
    }

    const clientBanned = userStatus.get(trip.client_id);
    const driverBanned = userStatus.get(trip.driver_id);

    if (clientBanned !== 'No' || driverBanned !== 'No') {
      continue;
    }

    const day = trip.request_at;
    totalsByDay.set(day, (totalsByDay.get(day) || 0) + 1);

    if (
      trip.status === 'cancelled_by_driver' ||
      trip.status === 'cancelled_by_client'
    ) {
      cancelledByDay.set(day, (cancelledByDay.get(day) || 0) + 1);
    }
  }

  const results = [];
  for (const [day, total] of totalsByDay.entries()) {
    const cancelled = cancelledByDay.get(day) || 0;
    const rate = total === 0 ? 0 : cancelled / total;
    results.push({
      day,
      cancellation_rate: Number(rate.toFixed(2)),
    });
  }

  return results;
}
```

**Time complexity**: `O(U + T)` where `U` is the number of users and `T` is the
number of trips.

**Data structures used**: `Map` for user lookup (`userStatus`) and two `Map`s
for per-day totals and cancellations to keep constant-time updates.

### Q4 – Edge Cases

* **A day has no valid trips (all trips involve banned/missing users).**
  Expected: that day is omitted from the output entirely.
* **All valid trips are completed (no cancellations).**
  Expected: cancellation rate is `0.00` for that day.
