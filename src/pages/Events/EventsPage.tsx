import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Users,
  Globe,
  Lock,
  Edit,
  Trash2,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Clock,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { DeleteDialog } from "../../components/shared/DeleteDialog";
import { useNavigate } from "react-router-dom";
import {
  GetPanigationMethod,
  DeleteMethod,
} from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { TableFilters } from "../../components/shared/TableFilters";
import Badge from "../../components/ui/badge/Badge";
import { useTranslation } from "react-i18next";

interface EventTitle {
  arabic: string;
  english: string;
}

interface Event {
  id: number;
  title: EventTitle;
  eventDate: string;
  eventType: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
}

interface EventsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    events: Event[];
  };
  totalItems: number;
  totalPages: number;
}

export default function EventsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    event: Event | null;
  }>({
    isOpen: false,
    event: null,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchEvents = async ({
    page,
    pageSize,
    searchTerm,
    eventType,
    isPublic,
    isActive,
  }: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    eventType?: string;
    isPublic?: string;
    isActive?: string;
  }): Promise<{
    data: Event[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      // Build query parameters - fix the search parameter
      const queryParams: Record<string, string> = {
        page: page.toString(),
        pageSize: pageSize.toString(),
      };

      // The search should be by title (english or arabic)
      if (searchTerm) {
        queryParams.title = searchTerm;
      }
      if (eventType && eventType !== "all") {
        queryParams.eventType = eventType;
      }
      if (isPublic && isPublic !== "all") {
        queryParams.isPublic = isPublic;
      }
      if (isActive && isActive !== "all") {
        queryParams.isActive = isActive;
      }

      console.log("Fetching events with params:", queryParams);

      const response = (await GetPanigationMethod(
        "/events",
        page,
        pageSize,
        lang,
        searchTerm,
        queryParams,
      )) as EventsResponse;

      const events = response.data?.events || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: events,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching events:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  // Separate function to fetch event types (for filter dropdown)
  const fetchEventTypes = async (): Promise<string[]> => {
    try {
      // Fetch first page to get event types
      const response = (await GetPanigationMethod(
        "/events",
        1,
        10,
        lang,
      )) as EventsResponse;

      const events = response.data?.events || [];

      // Extract unique event types
      const types = [...new Set(events.map((event) => event.eventType))];
      return types.filter((type) => type);
    } catch (error) {
      console.error("Error fetching event types:", error);
      return [];
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      const response = await DeleteMethod("/events", id.toString(), lang);

      if (response?.code === 200 || response?.code === 204) {
        return response;
      } else if (response?.message || response?.data) {
        return response;
      }

      throw new Error("Delete failed with no success indication");
    } catch (error) {
      console.error("Error in deleteEvent:", error);
      throw error;
    }
  };

  // Fetch event types for filter dropdown
  const { data: eventTypes = [] } = useQuery({
    queryKey: ["event-types", lang],
    queryFn: fetchEventTypes,
    staleTime: 5 * 60 * 1000,
  });

  // Main events query
  const {
    data: eventsResponse = {
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "events",
      currentPage,
      rowsPerPage,
      debouncedSearchTerm,
      typeFilter,
      visibilityFilter,
      statusFilter,
      lang,
    ],
    queryFn: () =>
      fetchEvents({
        page: currentPage,
        pageSize: rowsPerPage,
        searchTerm: debouncedSearchTerm || undefined,
        eventType: typeFilter !== "all" ? typeFilter : undefined,
        isPublic: visibilityFilter !== "all" ? visibilityFilter : undefined,
        isActive: statusFilter !== "all" ? statusFilter : undefined,
      }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: (data) => {
      console.log("Delete successful:", data);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event-types"] });
      setDeleteDialog({ isOpen: false, event: null });
      toast.success(t("events.deleteSuccess"));
    },
    onError: (error) => {
      console.error("Error deleting event:", error);
      toast.error(t("events.deleteError"));
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      key: "id",
      label: t("common.id", "ID"),
      width: "80px",
      render: (value: number) => (
        <div className="font-bold text-slate-700 dark:text-slate-300">
          #{value}
        </div>
      ),
    },
    {
      key: "title",
      label: t("events.columns.eventTitle", "Event Title"),
      render: (value: EventTitle, row: Event) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-lg">
            <Calendar
              size={18}
              className="text-purple-600 dark:text-purple-400"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 dark:text-white truncate">
              {value.english?.trim() ||
                t("events.untitledEvent", "Untitled Event")}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span>
                {t("common.id", "ID")}: {row.id}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                {row.eventType}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      label: t("events.columns.arabicTitle", "Arabic Title"),
      render: (value: EventTitle) => (
        <div
          className="font-semibold text-slate-900 dark:text-white text-right truncate"
          dir="rtl"
        >
          {value.arabic?.trim() ||
            t("events.untitledEventAr", "حدث بدون عنوان")}
        </div>
      ),
    },
    {
      key: "eventDate",
      label: t("events.columns.eventDateTime", "Event Date & Time"),
      width: "250px",
      render: (value: string) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={14} className="text-blue-500" />
            <span className="font-medium text-slate-900 dark:text-white text-sm">
              {formatDate(value)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={14} className="text-green-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatTime(value)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "eventType",
      label: t("events.columns.type", "Type"),
      width: "120px",
      render: (value: string) => {
        type BadgeColor =
          | "default"
          | "primary"
          | "secondary"
          | "success"
          | "warning"
          | "danger"
          | "info";

        let badgeColor: BadgeColor = "default";

        if (value === "Birthday") badgeColor = "success";
        else if (value === "Conference") badgeColor = "info";
        else if (value === "Meeting") badgeColor = "warning";
        else if (value === "Party") badgeColor = "primary";
        else if (value === "Wedding") badgeColor = "warning";
        else if (value === "Concert") badgeColor = "danger";
        else if (value === "Seminar") badgeColor = "info";
        else if (value === "Workshop") badgeColor = "secondary";
        else if (value === "Networking") badgeColor = "primary";
        else if (value === "Festival") badgeColor = "danger";

        return (
          <Badge variant="light" color={badgeColor}>
            {t(`events.types.${value}`, value)}
          </Badge>
        );
      },
    },
    {
      key: "isPublic",
      label: t("events.columns.visibility", "Visibility"),
      width: "120px",
      render: (value: boolean) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <Globe size={14} className="text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                {t("events.form.public")}
              </span>
            </>
          ) : (
            <>
              <Lock size={14} className="text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {t("events.form.private")}
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      label: t("events.columns.status", "Status"),
      width: "120px",
      render: (value: boolean) => (
        <Badge variant="light" color={value ? "success" : "warning"}>
          {value ? t("common.active") : t("common.inactive")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: t("events.columns.created", "Created"),
      width: "150px",
      render: (value: string) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-white text-sm">
            {new Date(value).toLocaleDateString(
              lang === "ar" ? "ar-SA" : "en-US",
            )}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(value).toLocaleTimeString(
              lang === "ar" ? "ar-SA" : "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </span>
        </div>
      ),
    },
    {
      key: "id",
      label: t("common.actions", "Actions"),
      width: "140px",
      render: (value: number, row: Event) => {
        if (!row) {
          return <div>{t("messages.error")}</div>;
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAction("edit", row)}
              className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 dark:hover:from-amber-500/20 dark:hover:to-orange-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-amber-200/50 dark:border-amber-500/20"
              title={t("common.edit")}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleAction("delete", row)}
              className="p-2 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-500/10 dark:to-pink-500/10 dark:hover:from-red-500/20 dark:hover:to-pink-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md border border-red-200/50 dark:border-red-500/20"
              title={t("common.delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const handleAction = (action: string, row: Event) => {
    if (action === "delete") {
      setDeleteDialog({ isOpen: true, event: row });
    } else if (action === "view") {
      navigate(`/events/${row.id}`);
    } else if (action === "edit") {
      navigate(`/events/edit/${row.id}`);
    }
  };

  const handleCreateEvent = () => {
    navigate("/events/create");
  };

  const handleRefresh = () => {
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setVisibilityFilter("all");
    setCurrentPage(1);
  };

  // Calculate statistics
  const calculateStats = (events: Event[]) => {
    const totalEvents = events.length;
    const activeEvents = events.filter((e) => e.isActive).length;
    const publicEvents = events.filter((e) => e.isPublic).length;
    const now = new Date();
    const upcomingEvents = events.filter(
      (e) => new Date(e.eventDate) > now,
    ).length;

    return {
      totalEvents,
      activeEvents,
      publicEvents,
      upcomingEvents,
      activePercentage:
        totalEvents > 0 ? Math.round((activeEvents / totalEvents) * 100) : 0,
    };
  };

  const stats = calculateStats(eventsResponse.data);

  // Filter options
  const statusOptions = [
    { value: "all", label: t("events.allStatus") },
    { value: "true", label: t("common.active") },
    { value: "false", label: t("common.inactive") },
  ];

  const visibilityOptions = [
    { value: "all", label: t("events.allVisibility") },
    { value: "true", label: t("events.form.public") },
    { value: "false", label: t("events.form.private") },
  ];

  const typeOptions = [
    { value: "all", label: t("events.allTypes") },
    ...eventTypes.map((type) => ({
      value: type,
      label: t(`events.types.${type}`, type),
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
              <Calendar size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 dark:from-slate-100 dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent">
                {t("events.management")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("events.managementSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw
                size={18}
                className={isLoading ? "animate-spin" : ""}
              />
              {t("common.refresh")}
            </button>

            <button
              onClick={handleCreateEvent}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus size={20} />
              {t("events.addEvent")}
            </button>
          </div>
        </div>

        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          showFilters={showFilters}
          show={false}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          searchPlaceholder={t("events.searchPlaceholder")}
          filterLabel={t("events.form.status")}
          additionalFilters={[]}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("common.loading")}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <Calendar size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("events.failedToLoad")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("events.fetchError")}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              {t("events.tryAgain")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && eventsResponse.data.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="text-purple-500 mb-4">
              <Calendar size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("events.noEventsFound")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearchTerm
                ? t("events.noEventsMatch")
                : t("events.noEventsInDB")}
            </p>
            {!debouncedSearchTerm && (
              <button
                onClick={handleCreateEvent}
                className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                {t("events.createFirstEvent")}
              </button>
            )}
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && eventsResponse.data.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <DataTable
              columns={columns}
              data={eventsResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={eventsResponse.total}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, event: null })}
        onConfirm={() => {
          if (deleteDialog.event) {
            deleteMutation.mutate(deleteDialog.event.id);
          }
        }}
        title={t("events.deleteConfirmTitle")}
        description={t("events.deleteConfirmDescription")}
        itemName={
          deleteDialog.event?.title.english?.trim() || t("events.unknownEvent")
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
