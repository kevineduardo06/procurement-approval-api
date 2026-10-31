# Development roadmap

This is a proposed backlog for ongoing personal development, not a claim that these features already exist or that a fixed schedule has been committed. Estimates are rough and should be revisited as work begins.

| Proposed work | Rough effort | Acceptance criteria |
| --- | ---: | --- |
| Tenant-aware approval authorization | 4–7 h | Cross-tenant approvals are rejected and covered by tests |
| Multi-stage approval policy | 6–10 h | Requests can require ordered approvals with explicit transitions |
| Budget reservation lifecycle hardening | 4–6 h | Rejection/cancellation edge cases preserve budget invariants |
| Supplier status validation | 3–5 h | Blocked suppliers cannot be used in draft updates or submissions |
| Pagination and deterministic ordering | 3–5 h | Stable filtered results with pagination tests |
| PostgreSQL persistence prototype | 8–14 h | Durable repositories, migrations, and integration tests |
| Audit log filtering and traceability | 3–5 h | Tenant-safe filters and consistent lifecycle audit events |
| API contract and end-to-end tests | 4–7 h | Documented example requests and expanded negative-path coverage |

**Estimated total: 35–59 hours**, conditional on actual implementation needs. Keep the backlog accurate as priorities change.
