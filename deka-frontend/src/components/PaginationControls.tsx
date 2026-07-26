const pageSizes = [25, 50, 100]

interface PaginationControlsProps {
  pageSize: number
  pageIndex: number
  totalPages: number
  onChangePageSize: (value:number) => void
  onChangePageIndex: (value:number) => void
}

export function PaginationControls({
  pageSize,
  pageIndex,
  totalPages,
  onChangePageSize,
  onChangePageIndex,
}: PaginationControlsProps) {
  return (
    <section className="pagination-controls">
      <div>
        <label>Page size</label>
        <select
          value={pageSize}
          onChange={e => {
            onChangePageSize(Number(e.target.value))
            onChangePageIndex(1)
          }}
        >
          {pageSizes.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button onClick={() => onChangePageIndex(Math.max(pageIndex - 1, 1))} disabled={pageIndex <= 1}>
          Previous
        </button>
        <span>Page {pageIndex}</span>
        <button onClick={() => onChangePageIndex(pageIndex + 1)} disabled={pageIndex >= totalPages}>
          Next
        </button>
      </div>
    </section>
  )
}