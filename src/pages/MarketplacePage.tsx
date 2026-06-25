import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { getMarketplacePosts } from "../api/post";
import type {
    DataPostPreview,
    Genre,
    SortOption,
} from "../types/post";
import { useAuth } from "../hooks/useAuth";
import { getPurchasesByUser } from "../api/purchase";

const PAGE_SIZE = 12;

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

const sortOptions: Array<{ label: string; value: SortOption }> = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Price: Low to High", value: "priceAsc" },
    { label: "Price: High to Low", value: "priceDesc" },
];

function formatGenre(genre: Genre): string {
    return genre
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-SG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function MarketplacePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [posts, setPosts] = useState<DataPostPreview[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [selectedGenre, setSelectedGenre] = useState<Genre | "ALL">("ALL");
    const [sort, setSort] = useState<SortOption>("newest");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [purchasedPostIds, setPurchasedPostIds] = useState<Set<number>>(
        new Set()
    );

    useEffect(() => {
        async function fetchMarketplacePosts() {
            try {
                setLoading(true);
                setError("");

                const result = await getMarketplacePosts({
                    page: page - 1,
                    size: PAGE_SIZE,
                    genre: selectedGenre === "ALL" ? undefined : selectedGenre,
                    sort,
                });

                setPosts(result.content);
                setTotalPages(result.totalPages === 0 ? 1 : result.totalPages);
                setTotalElements(result.totalElements);

                if (user?.role === "BUSINESS") {
                    const purchases = await getPurchasesByUser(user.id);

                    const ids = new Set(
                        purchases.map((purchase) => purchase.postId)
                    );

                    setPurchasedPostIds(ids);
                } else {
                    setPurchasedPostIds(new Set());
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load marketplace posts.");
            } finally {
                setLoading(false);
            }
        }

        fetchMarketplacePosts();
    }, [page, selectedGenre, sort, user]);

    function handleGenreChange(event: SelectChangeEvent) {
        setSelectedGenre(event.target.value as Genre | "ALL");
        setPage(1);
    }

    function handleSortChange(event: SelectChangeEvent) {
        setSort(event.target.value as SortOption);
        setPage(1);
    }

    function handlePageChange(_: ChangeEvent<unknown>, nextPage: number) {
        setPage(nextPage);
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
                            label="Marketplace"
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
                                maxWidth: 820,
                            }}
                        >
                            Discover AI-ready conversational datasets.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 720,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            Browse datasets by genre, compare credit prices, and inspect
                            marketplace listings before purchase. Search and advanced filters
                            can be added after the base marketplace flow is stable.
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
                                        Narrow the marketplace by genre and sort order.
                                    </Typography>
                                </Stack>

                                <FormControl fullWidth>
                                    <InputLabel
                                        id="genre-select-label"
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
                                        labelId="genre-select-label"
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
                                        id="sort-select-label"
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
                                        labelId="sort-select-label"
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
                                        RESULT COUNT
                                    </Typography>

                                    <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                        {totalElements} datasets
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
                                    Marketplace listings
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

                        {!loading && !error && posts.length === 0 && (
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
                                            No datasets found
                                        </Typography>

                                        <Typography sx={{ color: "#94A3B8" }}>
                                            Try selecting another genre or changing the sort option.
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {!loading && !error && posts.length > 0 && (
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "repeat(2, 1fr)",
                                        lg: "repeat(3, 1fr)",
                                    },
                                    gap: 2.5,
                                }}
                            >
                                {posts.map((post) => {
                                    const purchased = purchasedPostIds.has(post.id);

                                    return (
                                        <Card
                                            key={post.id}
                                            elevation={0}
                                            sx={{
                                                height: "100%",
                                                bgcolor: "rgba(15, 23, 42, 0.82)",
                                                color: "#FFFFFF",
                                                border: purchased
                                                    ? "1px solid rgba(74, 222, 128, 0.34)"
                                                    : "1px solid rgba(148, 163, 184, 0.18)",
                                                borderRadius: 4,
                                                boxShadow: "0 24px 70px rgba(0, 0, 0, 0.20)",
                                                transition:
                                                    "transform 160ms ease, border-color 160ms ease, background 160ms ease",
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    borderColor: purchased
                                                        ? "rgba(74, 222, 128, 0.52)"
                                                        : "rgba(103, 232, 249, 0.42)",
                                                    background: "rgba(15, 23, 42, 0.96)",
                                                },
                                            }}
                                        >
                                            <CardContent
                                                sx={{
                                                    p: 2.5,
                                                    height: "100%",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                }}
                                            >
                                                <Stack spacing={2} sx={{ height: "100%" }}>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            gap: 1.5,
                                                        }}
                                                    >
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            sx={{
                                                                flexWrap: "wrap",
                                                                rowGap: 1,
                                                            }}
                                                        >
                                                            <Chip
                                                                label={formatGenre(post.genre)}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: "rgba(6, 182, 212, 0.12)",
                                                                    color: "#A5F3FC",
                                                                    border: "1px solid rgba(6, 182, 212, 0.22)",
                                                                    fontWeight: 900,
                                                                }}
                                                            />

                                                            {purchased && (
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
                                                            )}

                                                            {post.adminReviewed && (
                                                                <Chip
                                                                    label="Admin reviewed"
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: "rgba(34, 197, 94, 0.12)",
                                                                        color: "#BBF7D0",
                                                                        border: "1px solid rgba(34, 197, 94, 0.24)",
                                                                        fontWeight: 900,
                                                                    }}
                                                                />
                                                            )}

                                                        </Stack>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: "#93C5FD",
                                                                fontWeight: 950,
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {post.price} credits
                                                        </Typography>
                                                    </Box>

                                                    <Box>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                color: "#FFFFFF",
                                                                fontWeight: 950,
                                                                lineHeight: 1.25,
                                                            }}
                                                        >
                                                            {post.title}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            title={post.summary}
                                                            sx={{
                                                                color: "#94A3B8",
                                                                lineHeight: 1.7,
                                                                mt: 1,
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 4,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                wordBreak: "break-word",
                                                            }}
                                                        >
                                                            {post.summary || "No summary available."}
                                                        </Typography>
                                                    </Box>

                                                    <Box sx={{ flexGrow: 1 }} />

                                                    <Box
                                                        sx={{
                                                            pt: 1.5,
                                                            borderTop: "1px solid rgba(148, 163, 184, 0.14)",
                                                        }}
                                                    >
                                                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                                                            Seller
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: "#CBD5E1", fontWeight: 800 }}
                                                        >
                                                            {post.username}
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            sx={{ display: "block", color: "#64748B", mt: 0.8 }}
                                                        >
                                                            Listed {formatDate(post.createdAt)}
                                                        </Typography>
                                                    </Box>

                                                    <Button
                                                        variant="outlined"
                                                        fullWidth
                                                        onClick={() => navigate(`/posts/${post.id}`)}
                                                        sx={{
                                                            mt: 0.5,
                                                            borderRadius: 999,
                                                            textTransform: "none",
                                                            fontWeight: 900,
                                                            color: purchased ? "#BBF7D0" : "#E0F2FE",
                                                            borderColor: purchased
                                                                ? "rgba(74, 222, 128, 0.34)"
                                                                : "rgba(125, 211, 252, 0.32)",
                                                            "&:hover": {
                                                                borderColor: purchased ? "#86EFAC" : "#67E8F9",
                                                                bgcolor: purchased
                                                                    ? "rgba(22, 163, 74, 0.08)"
                                                                    : "rgba(6, 182, 212, 0.08)",
                                                            },
                                                        }}
                                                    >
                                                        {purchased ? "View purchased data" : "View details"}
                                                    </Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Box>
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
