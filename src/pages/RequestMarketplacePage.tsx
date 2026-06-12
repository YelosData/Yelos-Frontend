import { useEffect, useState, type ChangeEvent } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
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
} from "../types/requestMarketplace";
import {
    getOpenRequests,
    submitToRequest,
} from "../api/requestMarketplace";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 6;

const GENRES: (Genre | "ALL")[] = [
    "ALL",
    "EDUCATION",
    "CUSTOMER_SUPPORT",
    "FINANCE",
    "CODING",
    "HEALTH_WELLNESS",
    "TRAVEL",
    "OTHER",
];

const SORT_OPTIONS: { value: RequestSortOption; label: string }[] = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "budgetDesc", label: "Highest Budget" },
    { value: "budgetAsc", label: "Lowest Budget" },
];

function formatGenre(genre: Genre | "ALL" | string): string {
    if (genre === "ALL") return "All Genres";

    return genre
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

function formatFileName(file: File | null): string {
    if (!file) return "No file selected";
    return file.name;
}

export default function RequestMarketplacePage() {
    const { user } = useAuth();

    const [requests, setRequests] = useState<DatasetRequest[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [genre, setGenre] = useState<Genre | "ALL">("ALL");
    const [sort, setSort] = useState<RequestSortOption>("newest");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedRequest, setSelectedRequest] = useState<DatasetRequest | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [message, setMessage] = useState("");
    const [proposedPrice, setProposedPrice] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const isSeller = user?.role === "SELLER";

    useEffect(() => {
        async function fetchOpenRequests() {
            if (!user?.id) {
                setRequests([]);
                setTotalPages(1);
                setTotalElements(0);
                setError("You must be logged in to view request marketplace.");
                return;
            }

            if (!isSeller) {
                setRequests([]);
                setTotalPages(1);
                setTotalElements(0);
                setError("Only sellers can view and submit to buyer requests.");
                return;
            }

            try {
                setLoading(true);
                setError("");
                setSuccess("");

                const result = await getOpenRequests({
                    page: page - 1,
                    size: PAGE_SIZE,
                    genre,
                    sort,
                });

                setRequests(Array.isArray(result.content) ? result.content : []);
                setTotalPages(result.totalPages === 0 ? 1 : result.totalPages);
                setTotalElements(result.totalElements);
            } catch (err) {
                console.error(err);
                setError("Failed to load open requests.");
                setRequests([]);
                setTotalPages(1);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        }

        fetchOpenRequests();
    }, [user?.id, isSeller, page, genre, sort]);

    function handlePageChange(_: ChangeEvent<unknown>, nextPage: number) {
        setPage(nextPage);
    }

    function handleGenreChange(value: Genre | "ALL") {
        setGenre(value);
        setPage(1);
    }

    function handleSortChange(value: RequestSortOption) {
        setSort(value);
        setPage(1);
    }

    function openSubmitDialog(request: DatasetRequest) {
        setSelectedRequest(request);
        setMessage("");
        setProposedPrice(String(request.budget));
        setFile(null);
        setError("");
        setSuccess("");
        setDialogOpen(true);
    }

    function resetDialogState() {
        setSelectedRequest(null);
        setMessage("");
        setProposedPrice("");
        setFile(null);
    }

    function closeSubmitDialog() {
        if (submitting) return;

        setDialogOpen(false);
        resetDialogState();
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!user?.id) {
            setError("You must be logged in to submit to a request.");
            return;
        }

        if (!isSeller) {
            setError("Only sellers can submit to buyer requests.");
            return;
        }

        if (!selectedRequest) {
            setError("No request selected.");
            return;
        }

        const parsedPrice = Number(proposedPrice);

        if (!proposedPrice || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
            setError("Proposed price must be greater than 0.");
            return;
        }

        if (parsedPrice > selectedRequest.budget) {
            setError("Proposed price cannot exceed the buyer's budget.");
            return;
        }

        if (!file) {
            setError("Please upload a dataset file.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await submitToRequest(selectedRequest.id, {
                sellerId: user.id,
                message: message.trim(),
                proposedPrice: parsedPrice,
                file,
            });

            setSuccess("Submission sent successfully.");
            setDialogOpen(false);
            resetDialogState();
        } catch (err) {
            console.error(err);
            setError("Failed to submit dataset. You may have already submitted to this request.");
        } finally {
            setSubmitting(false);
        }
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
                            label="Request Marketplace"
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
                                maxWidth: 880,
                            }}
                        >
                            Fulfil custom dataset requests.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 760,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            Browse open requests from business buyers, review their
                            specifications, and submit matching datasets for consideration.
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
                                Open buyer requests
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#94A3B8",
                                    mt: 0.5,
                                }}
                            >
                                {totalElements} open request
                                {totalElements === 1 ? "" : "s"} found
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
                                label="Genre"
                                value={genre}
                                onChange={(event) =>
                                    handleGenreChange(event.target.value as Genre | "ALL")
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
                                {GENRES.map((item) => (
                                    <MenuItem key={item} value={item}>
                                        {formatGenre(item)}
                                    </MenuItem>
                                ))}
                            </TextField>

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
                        </Stack>
                    </Box>

                    {error && <Alert severity="error">{error}</Alert>}

                    {success && <Alert severity="success">{success}</Alert>}

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
                                <Stack spacing={1}>
                                    <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                        No open requests found
                                    </Typography>

                                    <Typography sx={{ color: "#94A3B8" }}>
                                        There are no open buyer requests matching your filter.
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && requests.length > 0 && (
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
                                                        Requested by {request.buyerUsername} · Created{" "}
                                                        {formatDate(request.createdAt)}
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
                                                        label="Open"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "rgba(34, 197, 94, 0.12)",
                                                            color: "#BBF7D0",
                                                            border: "1px solid rgba(34, 197, 94, 0.25)",
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

                                            <Divider
                                                sx={{
                                                    borderColor: "rgba(148, 163, 184, 0.14)",
                                                }}
                                            />

                                            <Box>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "#67E8F9",
                                                        fontWeight: 900,
                                                        letterSpacing: 0.7,
                                                    }}
                                                >
                                                    BUYER SPECIFICATION
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

                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={1.5}
                                                sx={{ justifyContent: "flex-end" }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    onClick={() => openSubmitDialog(request)}
                                                    disabled={!isSeller}
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
                                                    Submit Dataset
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

            <Dialog
                open={dialogOpen}
                onClose={closeSubmitDialog}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "#0F172A",
                            color: "#FFFFFF",
                            borderRadius: 4,
                            border: "1px solid rgba(148, 163, 184, 0.18)",
                        },
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 950 }}>Submit Dataset</DialogTitle>

                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={2.5} sx={{ pt: 1 }}>
                            {selectedRequest && (
                                <Alert severity="info">
                                    Submitting to request #{selectedRequest.id}. Buyer budget:{" "}
                                    {selectedRequest.budget} credits.
                                </Alert>
                            )}

                            <TextField
                                label="Message"
                                value={message}
                                onChange={(event) => setMessage(event.target.value)}
                                fullWidth
                                multiline
                                minRows={4}
                                disabled={submitting}
                                placeholder="Describe why your dataset matches this request."
                                slotProps={{
                                    inputLabel: {
                                        sx: { color: "#94A3B8" },
                                    },
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: "#FFFFFF",
                                        bgcolor: "rgba(2, 6, 23, 0.55)",
                                        borderRadius: 3,
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "rgba(148, 163, 184, 0.24)",
                                    },
                                }}
                            />

                            <TextField
                                label="Proposed Price"
                                type="number"
                                value={proposedPrice}
                                onChange={(event) => setProposedPrice(event.target.value)}
                                fullWidth
                                disabled={submitting}
                                slotProps={{
                                    inputLabel: {
                                        sx: { color: "#94A3B8" },
                                    },
                                    htmlInput: {
                                        min: 1,
                                        step: 1,
                                    },
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        color: "#FFFFFF",
                                        bgcolor: "rgba(2, 6, 23, 0.55)",
                                        borderRadius: 3,
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "rgba(148, 163, 184, 0.24)",
                                    },
                                }}
                            />

                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: "rgba(2, 6, 23, 0.55)",
                                    border: "1px dashed rgba(148, 163, 184, 0.35)",
                                }}
                            >
                                <Stack spacing={1.5}>
                                    <Typography sx={{ fontWeight: 900 }}>
                                        Dataset file
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                        {formatFileName(file)}
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        component="label"
                                        disabled={submitting}
                                        sx={{
                                            width: "fit-content",
                                            borderRadius: 999,
                                            px: 3,
                                            color: "#A5F3FC",
                                            borderColor: "rgba(6, 182, 212, 0.35)",
                                            fontWeight: 900,
                                            "&:hover": {
                                                borderColor: "rgba(103, 232, 249, 0.65)",
                                                bgcolor: "rgba(103, 232, 249, 0.08)",
                                            },
                                        }}
                                    >
                                        Choose File
                                        <input
                                            hidden
                                            type="file"
                                            accept=".csv,.json,.txt,.xlsx"
                                            onChange={(event) => {
                                                const selectedFile =
                                                    event.target.files?.[0] ?? null;
                                                setFile(selectedFile);
                                            }}
                                        />
                                    </Button>
                                </Stack>
                            </Box>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                                sx={{ justifyContent: "flex-end", pt: 1 }}
                            >
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={closeSubmitDialog}
                                    disabled={submitting}
                                    sx={{
                                        borderRadius: 999,
                                        px: 3,
                                        color: "#CBD5E1",
                                        borderColor: "rgba(148, 163, 184, 0.28)",
                                        fontWeight: 900,
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={submitting}
                                    sx={{
                                        borderRadius: 999,
                                        px: 3,
                                        bgcolor: "#2563EB",
                                        fontWeight: 950,
                                        "&:hover": {
                                            bgcolor: "#1D4ED8",
                                        },
                                    }}
                                >
                                    {submitting ? "Submitting..." : "Submit Dataset"}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}