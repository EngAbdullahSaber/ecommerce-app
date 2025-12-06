// pages/users.tsx
"use client";
import { TableFilters } from "../../components/shared/TableFilters";
import { DataTable } from "../../components/shared/DataTable";
import { useTable } from "../../hooks/useTable";
const usersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@email.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@email.com",
    role: "User",
    status: "Inactive",
  },
  // ... more users
];

export default function UsersPage() {
  const table = useTable({
    initialData: usersData,
    initialRowsPerPage: 10,
  });

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <div>
      <TableFilters
        searchTerm={table.searchTerm}
        onSearchChange={table.setSearchTerm}
        statusFilter={table.statusFilter}
        onStatusFilter={table.setStatusFilter}
        showFilters={table.showFilters}
        onShowFiltersChange={table.setShowFilters}
        onClearFilters={table.clearFilters}
        searchPlaceholder="Search users..."
        filterOptions={["all", "Active", "Inactive"]}
        filterLabel="Status:"
      />

      <DataTable
        columns={columns}
        data={table.filteredData}
        currentPage={table.currentPage}
        rowsPerPage={table.rowsPerPage}
        totalItems={table.totalItems}
        onPageChange={table.setCurrentPage}
        onRowsPerPageChange={table.setRowsPerPage}
      />
    </div>
  );
}
