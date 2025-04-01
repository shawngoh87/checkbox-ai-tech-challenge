# Checkbox Tech Challenge

## Setting up

### Prerequisites

1. Docker
2. `nvm`
3. `node` 18
4. `npm`

### Initial setup

```bash
nvm use
npm install
cp .env.example .env
```

### Developing

```bash
npm run docker:dev:up
npm run test:watch
npm run dev  # Both client/server are served together
```

### Testing

```bash
npm run test
```

## Key design decisions

- Folder structure
- Extremely likely to have Kanban boards, so we implement the initial list as an infinitely-loaded list of tasks. Changing to Kanban board is a few `WHERE` clauses and database index away.
- Update task uses OCC - move to mergeable data structures if we have huge multiplayer needs 

## Approaching sort by created date and due date

> Implemented

Allow clients to send predefined sort configurations e.g. `created_at:asc` and `due_at:desc`. 

This encapsulates sorting functionality, prevents invalid configurations, and is extensible for arbitrary new sort types in the future.

Our repository then query with `ORDER BY <field>` in repository. 

## Approaching search by task name

> Not implemented

I would implement the first version with Postgres' built-in full-text search + trigram index, with the following assumptions:

1. We have insufficient operational experience on other, more powerful search engine.
2. We are unsure how frequently search is going to be used.

Write performance will be impacted by the new search indexes. If this becomes a problem, we can further offload search queries and indexes to read replicas only. The trade-off is that now newly-created tasks will take time to show up in search results. This can buy us some time.

After building the first version, we should measure search usage and evolve accordingly, potentially moving to a dedicated search engine e.g. ElasticSearch. We will publish domain events/change data capture, process it, and update the search engine.

## Handling large amount of tasks

### Client

> Not implemented

Since we have decided to build infinite scrolling, we need to implement virtualized list on client to reduce the amount of DOM elements present in the page.

### Server

> Partially implemented

We use cursor-based pagination on the database using sort keys `created_at` and `due_at`, along with `id` as the tiebreaker. See `findAll()` in [TaskRepository](src/server/infra/repository/task/task.repository.ts).

While `created_at` is immutable, `due_at` can be updated, which may cause missing/duplicated record in a paginated list. 

We can tackle this by (Not implemented):
1. snapshotting the list (e.g. `updated_at < time_of_search`), eliminating duplicated records entirely. 
2. send a realtime notification on client whenever a task is updated - notifying user that the current list is stale and please refresh.

## Further improvements

- Use a datatable library (e.g. TanStack table) that supports virtualization (mantine datatable does not support virtualization at the moment, see [here](https://github.com/icflorescu/mantine-datatable/pull/690))
- Load config based on NODE_ENV e.g. `.env.test` for test environment, so that we dont have to use different set of envs.
- Add index for due_at and created_at for sorting
- Refactor query builder code in TaskRepository
- Handle (the inevitable) duplicate/missing records in infinite scrolling list.