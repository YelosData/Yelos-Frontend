import { useEffect, useState, type ChangeEvent } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
    getPurchaseDownloadUrl,
    getPurchaseHistoryByUser,
    type PurchaseResponse,
} from "../api/purchase";
import type { Genre } from "../types/post";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 6;

type PurchaseSortOption = "newest" | "oldest" | "priceAsc" | "priceDesc";

const genreOptions: Array<{ label: string; value: Genre | "ALL" }> = [
    { label: "All", value: "ALL" },
    { label: "Education", value: "EDUCATION" },
    { label: "Customer Support", value: "CUSTOMER_SUPPORT" },
    { label: "Finance", value: "FINANCE" },
    { label: "Coding", value: "CODING" },
    { label: "Health & Wellness", value: "HEALTH_WELLNESS" },
    { label: "Travel", value: "TRAVEL" },
    { label: "Other", value: "OTHER" },
];

const sortOptions: Array<{ label: string; value: PurchaseSortOption }> = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Price: Low to High", value: "priceAsc" },
    { label: "Price: High to Low", value: "priceDesc" },
];

function formatGenre(genre: string): string {
    return genre
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function formatDate(dateString: string): string {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-SG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function MyPurchasesPage() {
    const { user } = useAuth();

    const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [selectedGenre, setSelectedGenre] = useState<Genre | "ALL">("ALL");
    const [sort, setSort] = useState<PurchaseSortOption>("newest");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [downloadLoadingId, setDownloadLoadingId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchPurchases() {
            if (!user?.id) {
                setPurchases([]);
                setTotalPages(1);
                setTotalElements(0);
                setError("You must be logged in to view your purchases.");
                return;
            }

            if (user.role !== "BUSINESS") {
                setPurchases([]);
                setTotalPages(1);
                setTotalElements(0);
                setError("Only business users can view purchase history.");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const result = await getPurchaseHistoryByUser(
                    user.id,
                    page - 1,
                    PAGE_SIZE,
                    selectedGenre,
                    sort,
                );

                setPurchases(Array.isArray(result.content) ? result.content : []);
                setTotalPages(result.totalPages === 0 ? 1 : result.totalPages);
                setTotalElements(result.totalElements);
            } catch (err) {
                console.error(err);
                setError("Failed to load your purchased datasets.");
                setPurchases([]);
                setTotalPages(1);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        }

        fetchPurchases();
    }, [user?.id, user?.role, page, selectedGenre, sort]);

    function formatFileSize(sizeInBytes: number) {
        if (sizeInBytes < 1024) {
            return `${sizeInBytes} B`;
        }

        if (sizeInBytes < 1024 * 1024) {
            return `${(sizeInBytes / 1024).toFixed(1)} KB`;
        }

        return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function handleGenreChange(event: SelectChangeEvent) {
        setSelectedGenre(event.target.value as Genre | "ALL");
        setPage(1);
    }

    function handleSortChange(event: SelectChangeEvent) {
        setSort(event.target.value as PurchaseSortOption);
        setPage(1);
    }

    function handlePageChange(_: ChangeEvent<unknown>, nextPage: number) {
        setPage(nextPage);
    }

    async function handleDownload(purchaseId: number) {
        try {
            setDownloadLoadingId(purchaseId);
            setError("");

            const result = await getPurchaseDownloadUrl(purchaseId);

            window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
        } catch (err) {
            console.error(err);
            setError("Failed to generate download link. Please try again.");
        } finally {
            setDownloadLoadingId(null);
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
                            label="Purchase History"
                            sx={{
                                width: "fit-content",
                                bgcolor: "rgba(6, 182, 212, 0.12)",
                                color: "#A5F3FC",
                                border: "1px solid rgba(6, 182, 212, 0.26)",
                                fontWeight: 900,
                                letterSpacing: 0.2,
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
                            View every dataset your business has purchased.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 760,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            Browse your purchased datasets by genre and sort order. Each
                            purchase includes the saved listing snapshot and a secure download link.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
                        gap: 3,
                    }}
                >
                    <Card
                        elevation={0}
                        sx={{
                            height: "fit-content",
                            position: { md: "sticky" },
                            top: { md: 88 },
                            bgcolor: "rgba(15, 23, 42, 0.82)",
                            color: "#FFFFFF",
                            border: "1px solid rgba(148, 163, 184, 0.18)",
                            borderRadius: 4,
                            boxShadow: "0 24px 70px rgba(0, 0, 0, 0.22)",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2.5}>
                                <Stack spacing={0.5}>
                                    <Typography sx={{ fontWeight: 950, color: "#FFFFFF" }}>
                                        Filters
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                        Narrow your purchase history by genre and sort order.
                                    </Typography>
                                </Stack>

                                <FormControl fullWidth>
                                    <InputLabel
                                        id="purchase-genre-select-label"
                                        sx={{
                                            color: "#94A3B8",
                                            "&.Mui-focused": {
                                                color: "#67E8F9",
                                            },
                                        }}
                                    >
                                        Genre
                                    </InputLabel>

                                    <Select
                                        labelId="purchase-genre-select-label"
                                        label="Genre"
                                        value={selectedGenre}
                                        onChange={handleGenreChange}
                                        sx={{
                                            color: "#FFFFFF",
                                            borderRadius: 2.5,
                                            ".MuiOutlinedInput-notchedOutline": {
                                                borderColor: "rgba(148, 163, 184, 0.28)",
                                            },
                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "rgba(103, 232, 249, 0.52)",
                                            },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "#67E8F9",
                                            },
                                            ".MuiSvgIcon-root": {
                                                color: "#CBD5E1",
                                            },
                                        }}
                                    >
                                        {genreOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel
                                        id="purchase-sort-select-label"
                                        sx={{
                                            color: "#94A3B8",
                                            "&.Mui-focused": {
                                                color: "#67E8F9",
                                            },
                                        }}
                                    >
                                        Sort
                                    </InputLabel>

                                    <Select
                                        labelId="purchase-sort-select-label"
                                        label="Sort"
                                        value={sort}
                                        onChange={handleSortChange}
                                        sx={{
                                            color: "#FFFFFF",
                                            borderRadius: 2.5,
                                            ".MuiOutlinedInput-notchedOutline": {
                                                borderColor: "rgba(148, 163, 184, 0.28)",
                                            },
                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "rgba(103, 232, 249, 0.52)",
                                            },
                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                borderColor: "#67E8F9",
                                            },
                                            ".MuiSvgIcon-root": {
                                                color: "#CBD5E1",
                                            },
                                        }}
                                    >
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

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
                                        PURCHASED DATASETS
                                    </Typography>

                                    <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                        {totalElements} purchase{totalElements === 1 ? "" : "s"}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Stack spacing={3}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                justifyContent: "space-between",
                                gap: 1.5,
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="h5"
                                    sx={{ color: "#FFFFFF", fontWeight: 950 }}
                                >
                                    Purchased datasets
                                </Typography>

                                <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.5 }}>
                                    Page {page} of {totalPages}
                                </Typography>
                            </Box>

                            <Chip
                                label={
                                    selectedGenre === "ALL"
                                        ? "All genres"
                                        : formatGenre(selectedGenre)
                                }
                                sx={{
                                    width: "fit-content",
                                    bgcolor: "rgba(37, 99, 235, 0.14)",
                                    color: "#BFDBFE",
                                    border: "1px solid rgba(37, 99, 235, 0.24)",
                                    fontWeight: 900,
                                }}
                            />
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
                                    <Typography sx={{ fontWeight: 900 }}>{error}</Typography>
                                </CardContent>
                            </Card>
                        )}

                        {!loading && !error && purchases.length === 0 && (
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
                                            No purchased datasets found
                                        </Typography>

                                        <Typography sx={{ color: "#94A3B8" }}>
                                            Once this business account purchases a dataset, it will
                                            appear here with its full content.
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {!loading && !error && purchases.length > 0 && (
                            <Stack spacing={3}>
                                {purchases.map((purchase) => (
                                    <Card
                                        key={purchase.id}
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
                                                            {purchase.titleSnapshot}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: "#64748B",
                                                                mt: 0.8,
                                                            }}
                                                        >
                                                            Purchased {formatDate(purchase.purchasedAt)}
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
                                                            label={`${purchase.price} credits`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: "rgba(37, 99, 235, 0.14)",
                                                                color: "#BFDBFE",
                                                                border: "1px solid rgba(37, 99, 235, 0.24)",
                                                                fontWeight: 900,
                                                            }}
                                                        />

                                                        <Chip
                                                            label="Purchased"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: "rgba(22, 163, 74, 0.14)",
                                                                color: "#BBF7D0",
                                                                border: "1px solid rgba(74, 222, 128, 0.24)",
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
                                                        SUMMARY
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            color: "#CBD5E1",
                                                            lineHeight: 1.75,
                                                            mt: 0.8,
                                                        }}
                                                    >
                                                        {purchase.summarySnapshot}
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "#67E8F9",
                                                            fontWeight: 900,
                                                            letterSpacing: 0.7,
                                                        }}
                                                    >
                                                        DATASET FILE
                                                    </Typography>

                                                    <Box
                                                        sx={{
                                                            mt: 1,
                                                            p: 2,
                                                            borderRadius: 3,
                                                            bgcolor: "rgba(2, 6, 23, 0.72)",
                                                            border: "1px solid rgba(148, 163, 184, 0.14)",
                                                        }}
                                                    >
                                                        <Stack
                                                            direction={{ xs: "column", sm: "row" }}
                                                            spacing={2}
                                                            sx={{
                                                                justifyContent: "space-between",
                                                                alignItems: { xs: "stretch", sm: "center" },
                                                            }}
                                                        >
                                                            <Stack spacing={0.6}>
                                                                <Typography sx={{ color: "#E2E8F0", fontWeight: 900 }}>
                                                                    {purchase.fileNameSnapshot || "Dataset file"}
                                                                </Typography>

                                                                <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                                                    {purchase.fileTypeSnapshot || "Unknown file type"}
                                                                    {purchase.fileSizeSnapshot
                                                                        ? ` · ${formatFileSize(purchase.fileSizeSnapshot)}`
                                                                        : ""}
                                                                </Typography>

                                                                <Typography variant="caption" sx={{ color: "#64748B" }}>
                                                                    This file is stored privately and can only be downloaded through a temporary secure link.
                                                                </Typography>
                                                            </Stack>

                                                            <Button
                                                                variant="contained"
                                                                disabled={downloadLoadingId === purchase.id}
                                                                onClick={() => handleDownload(purchase.id)}
                                                                sx={{
                                                                    borderRadius: 999,
                                                                    textTransform: "none",
                                                                    fontWeight: 900,
                                                                    px: 3,
                                                                    bgcolor: "#2563EB",
                                                                    boxShadow: "0 14px 34px rgba(37, 99, 235, 0.34)",
                                                                    "&:hover": {
                                                                        bgcolor: "#1D4ED8",
                                                                        boxShadow: "0 16px 42px rgba(37, 99, 235, 0.44)",
                                                                    },
                                                                }}
                                                            >
                                                                {downloadLoadingId === purchase.id ? "Preparing..." : "Download"}
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        display: "grid",
                                                        gridTemplateColumns: {
                                                            xs: "1fr",
                                                            sm: "repeat(3, 1fr)",
                                                        },
                                                        gap: 1.5,
                                                        pt: 1,
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
                                                            POST ID
                                                        </Typography>

                                                        <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                                            {purchase.postId}
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
                                                            SELLER ID
                                                        </Typography>

                                                        <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                                            {purchase.sellerId}
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
                                                            PURCHASE ID
                                                        </Typography>

                                                        <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                                            {purchase.id}
                                                        </Typography>
                                                    </Box>
                                                </Box>
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
                </Box>
            </Container>
        </Box>
    );
}