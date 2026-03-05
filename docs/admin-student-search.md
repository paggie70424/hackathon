# Admin Dashboard — Student Search & Filter

**Date:** 2026-03-05  
**File modified:** `src/views/AdminDashboard.vue`

---

## What Was Added

### 1. Connected Students Panel (new `section-card`)

A new card section was inserted between the **Stats Cards** and the **Athena Query Preview** block.

It contains:

| UI element | Behaviour |
|---|---|
| **Badge** `N connected` | Live count of students returned by `/api/admin/whoop-summary` |
| **Search input** (`#student-search-input`) | Live text filter — matches `owner_id`, `email`, or `display_name` |
| **Dropdown select** (`#student-select-dropdown`) | Pick one student by email + id, or "All Students" |
| **Chips row** | One pill per student showing `owner_id · email`; click to select |
| **"All" chip** | Resets both `selectedStudent` and `searchQuery` |
| **No-match message** | Shown when search finds nothing |

---

### 2. New Reactive State (script)

```js
const searchQuery     = ref('')       // bound to search input
const selectedStudent = ref(null)     // null = show all; set to owner_id string to filter

const filteredRows = computed(() => {
  let result = rows.value
  if (selectedStudent.value)
    result = result.filter(r => r.owner_id === selectedStudent.value)
  const q = searchQuery.value.trim().toLowerCase()
  if (q)
    result = result.filter(r =>
      String(r.owner_id).toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.display_name || '').toLowerCase().includes(q)
    )
  return result
})
```

---

### 3. Analytics Table — now uses `filteredRows`

Before:
```html
<tr v-for="row in rows" :key="row.owner_id">
```

After:
```html
<tr v-for="row in filteredRows" :key="row.owner_id">
```

The empty-state message was also updated: if `filteredRows` is empty but `rows` is not, it shows "No students match your filter" with a **Clear filter** button.

---

### 4. New CSS classes

| Class | Purpose |
|---|---|
| `.student-search-card` | Wrapper padding override |
| `.student-count-badge` | Green pill showing connected count |
| `.search-controls` | Flex row for input + select |
| `.search-input` | Styled text input with purple focus ring |
| `.student-select` | Styled `<select>` dropdown |
| `.student-chips` | Flex-wrap chip row |
| `.student-chip` | Pill button per student; `.active` = purple highlight |
| `.chip-id`, `.chip-email`, `.chip-sep` | Mono ID, blue email, grey separator |
| `.search-no-result` | Soft grey message when filter returns 0 rows |
| `.link-btn` | Inline text button for "Clear filter" |

---

## How to Extend in the Future

- **Per-student Data Preview** — pass `selectedStudent` to `loadPreview()` and add a `?owner_id=` query param to `/api/admin/whoop-raw/:productId` so it only returns that student's rows.
- **Sort by column** — add a `sortKey` + `sortDir` ref and sort `filteredRows` inside the computed.
- **More device types** — add Apple Watch / Fitbit chips by extending the `rows` array schema in the backend.
