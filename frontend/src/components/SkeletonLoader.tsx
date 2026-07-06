export const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
    <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-2/3" />
  </div>
);

export const SkeletonTable = ({ rows, cols }: { rows: number; cols: number }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <table className="w-full text-sm">
      <tbody className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
);
