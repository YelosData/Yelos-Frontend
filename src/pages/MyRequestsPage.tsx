import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    MenuItem,
    Pagination,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type { Genre } from "../types/post";
import type {
    DatasetRequest,
    RequestSortOption,
    RequestStatus,
} from "../types/requestMarketplace";
import { getBuyerRequests } from "../api/requestMarketplace";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 6;

const SORT_OPTIONS: { value: RequestSortOption; label: string }[] = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "budgetDesc", label: "Highest Budget" },
    { value: "budgetAsc", label: "Lowest Budget" },
];

function formatGenre(genre: Genre | string): string {
    return genre
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function formatStatus(status: RequestStatus): string {
    return status
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function formatDate(dateString: string | null): string {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-SG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getStatusChipStyle(status: RequestStatus) {
    if (status === "OPEN") {
        return {
            bgcolor: "rgba(34, 197, 94, 0.12)",
            color: "#BBF7D0",
            border: "1px solid rgba(34, 197, 94, 0.25)",
        };
    }

    if (status === "COMPLETED") {
        return {
            bgcolor: "rgba(37, 99, 235, 0.14)",
            color: "#BFDBFE",
            border: "1px solid rgba(37, 99, 235, 0.26)",
        };
    }

    return {
        bgcolor: "rgba(248, 113, 113, 0.12)",
        color: "#FECACA",
        border: "1px solid rgba(248, 113, 113, 0.25)",
    };
}

export default function MyRequestsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [requests, setRequests] = useState<DatasetRequest[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [sort, setSort] = useState<RequestSortOption>("newest");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isBusinessUser = user?.role === "BUSINESS";

    useEffect(() => {
        async function fetchRequests() {
            if (!user?.id) {
                setRequests([]);
                setTotalPages(1);
                setTotalElements(0);
                setError("You must be logged in to view your requests.");
                return;
            }

            if (!isBusinessUser) {
                setRequests([]);
                setTotalPages(1);
                setTotalElements(0);
                setError("Only business users can view dataset requests.");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const result = await getBuyerRequests(
                    user.id,
                    page - 1,
                    PAGE_SIZE,
                    sort
                );

                setRequests(Array.isArray(result.content) ? result.content : []);
                setTotalPages(result.totalPages === 0 ? 1 : result.totalPages);
                setTotalElements(result.totalElements);
            } catch (err) {
                console.error(err);
                setError("Failed to load your dataset requests.");
                setRequests([]);
                setTotalPages(1);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        }

        fetchRequests();
    }, [user?.id, isBusinessUser, page, sort]);

    function handlePageChange(_: ChangeEvent<unknown>, nextPage: number) {
        setPage(nextPage);
    }

    function handleSortChange(value: RequestSortOption) {
        setSort(value);
        setPage(1);
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#020617",
                color: "#FFFFFF",
                pb: 8,
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
                    background:
                        "radial-gradient(circle at top left, rgba(6, 182, 212, 0.22), transparent 32%), radial-gradient(circle at top right, rgba(37, 99, 235, 0.22), transparent 30%), #020617",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.08,
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
                        backgroundSize: "42px 42px",
                    }}
                />

                <Container
                    maxWidth="lg"
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        py: { xs: 6, md: 8 },
                    }}
                >
                    <Stack spacing={2}>
                        <Chip
                            label="My Requests"
                            sx={{
                                width: "fit-content",
                                bgcolor: "rgba(6, 182, 212, 0.12)",
                                color: "#A5F3FC",
                                border: "1px solid rgba(6, 182, 212, 0.26)",
                                fontWeight: 900,
                            }}
                        />

                        <Typography
                            variant="h2"
                            sx={{
                                color: "#FFFFFF",
                                fontWeight: 950,
                                letterSpacing: "-0.055em",
                                lineHeight: 1,
                                fontSize: { xs: "2.3rem", md: "4rem" },
                                maxWidth: 850,
                            }}
                        >
                            Track your custom dataset requests.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 720,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            View your open requests, review seller submissions, and download
                            accepted datasets once a request is completed.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
                <Stack spacing={3}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            justifyContent: "space-between",
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 950 }}>
                                Created requests
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#94A3B8",
                                    mt: 0.5,
                                }}
                            >
                                {totalElements} request{totalElements === 1 ? "" : "s"} created
                            </Typography>
                        </Box>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1.5}
                            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
                        >
                            <TextField
                                select
                                size="small"
                                label="Sort"
                                value={sort}
                                onChange={(event) =>
                                    handleSortChange(event.target.value as RequestSortOption)
                                }
                                slotProps={{
                                    inputLabel: {
                                        sx: { color: "#94A3B8" },
                                    },
                                }}
                                sx={{
                                    minWidth: 180,
                                    "& .MuiOutlinedInput-root": {
                                        color: "#FFFFFF",
                                        bgcolor: "rgba(15, 23, 42, 0.8)",
                                        borderRadius: 3,
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "rgba(148, 163, 184, 0.24)",
                                    },
                                    "& .MuiSvgIcon-root": {
                                        color: "#CBD5E1",
                                    },
                                }}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Button
                                variant="contained"
                                onClick={() => navigate("/requests/create")}
                                sx={{
                                    borderRadius: 999,
                                    px: 3,
                                    py: 1,
                                    bgcolor: "#2563EB",
                                    fontWeight: 950,
                                    "&:hover": {
                                        bgcolor: "#1D4ED8",
                                    },
                                }}
                            >
                                Create Request
                            </Button>
                        </Stack>
                    </Box>

                    {loading && (
                        <Box
                            sx={{
                                py: 8,
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <CircularProgress sx={{ color: "#67E8F9" }} />
                        </Box>
                    )}

                    {!loading && error && (
                        <Card
                            elevation={0}
                            sx={{
                                bgcolor: "rgba(127, 29, 29, 0.18)",
                                border: "1px solid rgba(248, 113, 113, 0.28)",
                                borderRadius: 4,
                                color: "#FECACA",
                            }}
                        >
                            <CardContent>
                                <Alert severity="error">{error}</Alert>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !error && requests.length === 0 && (
                        <Card
                            elevation={0}
                            sx={{
                                bgcolor: "rgba(15, 23, 42, 0.82)",
                                color: "#FFFFFF",
                                border: "1px solid rgba(148, 163, 184, 0.18)",
                                borderRadius: 4,
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                        You have not created any requests yet
                                    </Typography>

                                    <Typography sx={{ color: "#94A3B8" }}>
                                        Create a request to let sellers submit datasets that match
                                        your requirements.
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        onClick={() => navigate("/requests/create")}
                                        sx={{
                                            width: "fit-content",
                                            borderRadius: 999,
                                            px: 3,
                                            py: 1,
                                            bgcolor: "#2563EB",
                                            fontWeight: 950,
                                            "&:hover": {
                                                bgcolor: "#1D4ED8",
                                            },
                                        }}
                                    >
                                        Create Request
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !error && requests.length > 0 && (
                        <Stack spacing={3}>
                            {requests.map((request) => (
                                <Card
                                    key={request.id}
                                    elevation={0}
                                    sx={{
                                        bgcolor: "rgba(15, 23, 42, 0.82)",
                                        color: "#FFFFFF",
                                        border: "1px solid rgba(148, 163, 184, 0.18)",
                                        borderRadius: 4,
                                        boxShadow: "0 24px 70px rgba(0, 0, 0, 0.20)",
                                        transition:
                                            "transform 160ms ease, border-color 160ms ease, background 160ms ease",
                                        "&:hover": {
                                            transform: "translateY(-3px)",
                                            borderColor: "rgba(103, 232, 249, 0.42)",
                                            background: "rgba(15, 23, 42, 0.96)",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                        <Stack spacing={2.5}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: { xs: "column", sm: "row" },
                                                    justifyContent: "space-between",
                                                    gap: 2,
                                                }}
                                            >
                                                <Box>
                                                    <Typography
                                                        variant="h5"
                                                        sx={{
                                                            color: "#FFFFFF",
                                                            fontWeight: 950,
                                                            lineHeight: 1.25,
                                                        }}
                                                    >
                                                        {formatGenre(request.genre)} Dataset Request
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#64748B",
                                                            mt: 0.8,
                                                        }}
                                                    >
                                                        Created {formatDate(request.createdAt)}
                                                    </Typography>
                                                </Box>

                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{
                                                        flexWrap: "wrap",
                                                        rowGap: 1,
                                                        alignItems: "flex-start",
                                                    }}
                                                >
                                                    <Chip
                                                        label={formatStatus(request.status)}
                                                        size="small"
                                                        sx={{
                                                            ...getStatusChipStyle(request.status),
                                                            fontWeight: 900,
                                                        }}
                                                    />

                                                    <Chip
                                                        label={`${request.budget} credits`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "rgba(37, 99, 235, 0.14)",
                                                            color: "#BFDBFE",
                                                            border: "1px solid rgba(37, 99, 235, 0.24)",
                                                            fontWeight: 900,
                                                        }}
                                                    />

                                                    <Chip
                                                        label={formatGenre(request.genre)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "rgba(6, 182, 212, 0.12)",
                                                            color: "#A5F3FC",
                                                            border: "1px solid rgba(6, 182, 212, 0.22)",
                                                            fontWeight: 900,
                                                        }}
                                                    />
                                                </Stack>
                                            </Box>

                                            <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.14)" }} />

                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "#67E8F9",
                                                        fontWeight: 900,
                                                        letterSpacing: 0.7,
                                                    }}
                                                >
                                                    SPECIFICATION
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        color: "#CBD5E1",
                                                        lineHeight: 1.75,
                                                        mt: 0.8,
                                                        whiteSpace: "pre-wrap",
                                                    }}
                                                >
                                                    {request.specification}
                                                </Typography>
                                            </Box>

                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: {
                                                        xs: "1fr",
                                                        sm: "repeat(3, 1fr)",
                                                    },
                                                    gap: 1.5,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 3,
                                                        bgcolor: "rgba(6, 182, 212, 0.08)",
                                                        border: "1px solid rgba(6, 182, 212, 0.18)",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "#67E8F9",
                                                            fontWeight: 900,
                                                            letterSpacing: 0.7,
                                                        }}
                                                    >
                                                        REQUEST ID
                                                    </Typography>

                                                    <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                                        {request.id}
                                                    </Typography>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 3,
                                                        bgcolor: "rgba(37, 99, 235, 0.10)",
                                                        border: "1px solid rgba(37, 99, 235, 0.20)",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "#93C5FD",
                                                            fontWeight: 900,
                                                            letterSpacing: 0.7,
                                                        }}
                                                    >
                                                        UPDATED
                                                    </Typography>

                                                    <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                                        {formatDate(request.updatedAt)}
                                                    </Typography>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 3,
                                                        bgcolor: "rgba(14, 165, 233, 0.08)",
                                                        border: "1px solid rgba(14, 165, 233, 0.18)",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "#7DD3FC",
                                                            fontWeight: 900,
                                                            letterSpacing: 0.7,
                                                        }}
                                                    >
                                                        COMPLETED
                                                    </Typography>

                                                    <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                                        {formatDate(request.completedAt)}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={1.5}
                                                sx={{ justifyContent: "flex-end" }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    onClick={() =>
                                                        navigate(`/requests/${request.id}`, {
                                                            state: { request },
                                                        })
                                                    }
                                                    sx={{
                                                        borderRadius: 999,
                                                        px: 3,
                                                        py: 1,
                                                        color: "#A5F3FC",
                                                        borderColor: "rgba(6, 182, 212, 0.35)",
                                                        fontWeight: 900,
                                                        "&:hover": {
                                                            borderColor: "rgba(103, 232, 249, 0.65)",
                                                            bgcolor: "rgba(103, 232, 249, 0.08)",
                                                        },
                                                    }}
                                                >
                                                    View Submissions
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}

                    {!loading && !error && totalPages > 1 && (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                pt: 2,
                                ".MuiPaginationItem-root": {
                                    color: "#CBD5E1",
                                    borderColor: "rgba(148, 163, 184, 0.28)",
                                },
                                ".Mui-selected": {
                                    bgcolor: "#2563EB !important",
                                    color: "#FFFFFF",
                                    fontWeight: 900,
                                },
                            }}
                        >
                            <Pagination
                                page={page}
                                count={totalPages}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                            />
                        </Box>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}