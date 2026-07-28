### Task 6: JobBoardPage Responsive Update

**Files:**
- Modify: `src/components/jobs/JobBoardPage.tsx`
- Modify: `src/components/jobs/FilterSidebar.tsx` (extract shared FilterOption)

**Interfaces:**
- Consumes: `FilterDrawer`, `ActiveFilterChips` from Task 5; existing `FilterSidebar`
- Produces: Responsive JobBoardPage with conditional filter rendering

- [ ] **Step 1: Extract FilterOption from FilterSidebar into shared helper**

Move the `FilterOption` sub-component to a shared location or keep it in FilterSidebar but export it for reuse by FilterDrawer. Since FilterDrawer uses a different layout (pill buttons instead of list items), keep them separate — no extraction needed.

- [ ] **Step 2: Update JobBoardPage with responsive filter rendering**

```tsx
// Key changes in JobBoardPage.tsx:
// 1. Add state for filter drawer open/close
// 2. Conditionally render FilterSidebar (lg+) vs FilterDrawer trigger (<lg)
// 3. Add ActiveFilterChips below search bar on mobile

const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

const activeFilterCount = [filters.category, filters.seniority, filters.remote].filter(Boolean).length

// In the JSX, replace the grid section:
<>
  {/* Mobile: search + filter trigger */}
  <div className="lg:hidden flex gap-3 mb-4">
    <div className="flex-1">
      <SearchBar value={search} onChange={handleSearchChange} />
    </div>
    <Button
      variant="secondary"
      size="md"
      onClick={() => setFilterDrawerOpen(true)}
      className="shrink-0"
    >
      Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
    </Button>
  </div>

  {/* Desktop: search bar */}
  <Reveal className="hidden lg:block max-w-xl mb-8">
    <SearchBar value={search} onChange={handleSearchChange} />
  </Reveal>

  {/* Mobile: active filter chips */}
  <div className="lg:hidden">
    <ActiveFilterChips filters={filters} onFilterChange={handleFilterChange} />
  </div>

  {/* Filter drawer for mobile */}
  <FilterDrawer
    open={filterDrawerOpen}
    onOpenChange={setFilterDrawerOpen}
    filters={filters}
    onFilterChange={handleFilterChange}
    activeCount={activeFilterCount}
  />

  {/* Desktop: sidebar layout */}
  <div className="hidden lg:grid grid-cols-[280px_1fr] gap-8">
    <Reveal delay={0.05}><FilterSidebar filters={filters} onFilterChange={handleFilterChange} /></Reveal>
    <Reveal delay={0.1}>
      <JobCardGrid jobs={filteredJobs} />
      {hasMore && (
        <div className="mt-8 text-center">
          <Button variant="ghost" size="md" onClick={() => loadJobs(false)} disabled={loadingMore}>
            {loadingMore ? 'Loading more...' : `Load more (${filteredJobs.length} of ${total})`}
          </Button>
        </div>
      )}
    </Reveal>
  </div>

  {/* Mobile: jobs grid without sidebar */}
  <div className="lg:hidden">
    <JobCardGrid jobs={filteredJobs} />
    {hasMore && (
      <div className="mt-8 text-center">
        <Button variant="ghost" size="md" onClick={() => loadJobs(false)} disabled={loadingMore}>
          {loadingMore ? 'Loading more...' : `Load more (${filteredJobs.length} of ${total})`}
        </Button>
      </div>
    )}
  </div>
</>
```

- [ ] **Step 3: Run build to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/jobs/JobBoardPage.tsx
git commit -m "feat: responsive job board with mobile filter drawer and active filter chips"
```

---

