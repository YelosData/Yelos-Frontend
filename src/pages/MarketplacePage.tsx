import { useEffect, useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
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
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { getMarketplacePosts, searchDataPosts } from "../api/post";
import type {
    DataPostPreview,
    Genre,
    SortOption,
} from "../types/post";
import { useAuth } from "../hooks/useAuth";
import { getPurchasesByUser } from "../api/purchase";

const PAGE_SIZE = 12;
const AI_SEARCH_LIMIT = 30;

type SearchMode = "browse" | "ai";

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

function filterAndSortPosts(
    results: DataPostPreview[],
    selectedGenre: Genre | "ALL",
    sort: SortOption,
): DataPostPreview[] {
    const filtered =
        selectedGenre === "ALL"
            ? results
            : results.filter((post) => post.genre === selectedGenre);

    return [...filtered].sort((a, b) => {
        if (sort === "newest") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        if (sort === "oldest") {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }

        if (sort === "priceAsc") {
            return Number(a.price) - Number(b.price);
        }

        if (sort === "priceDesc") {
            return Number(b.price) - Number(a.price);
        }

        return 0;
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

    const [searchMode, setSearchMode] = useState<SearchMode>("browse");
    const [searchInput, setSearchInput] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState("");

    const isAiMode = searchMode === "ai";
    const hasActiveAiQuery = isAiMode && activeSearchQuery.trim().length > 0;

    useEffect(() => {
        async function fetchMarketplacePosts() {
            try {
                setLoading(true);
                setError("");

                if (isAiMode && !activeSearchQuery.trim()) {
                    setPosts([]);
                    setTotalPages(1);
                    setTotalElements(0);
                    return;
                }

                if (hasActiveAiQuery) {
                    const aiResults = await searchDataPosts(
                        activeSearchQuery.trim(),
                        AI_SEARCH_LIMIT,
                    );

                    const filteredAndSortedResults = filterAndSortPosts(
                        aiResults,
                        selectedGenre,
                        sort,
                    );

                    setPosts(filteredAndSortedResults);
                    setTotalPages(1);
                    setTotalElements(filteredAndSortedResults.length);
                } else {
                    const result = await getMarketplacePosts({
                        page: page - 1,
                        size: PAGE_SIZE,
                        genre: selectedGenre === "ALL" ? undefined : selectedGenre,
                        sort,
                    });

                    setPosts(result.content);
                    setTotalPages(result.totalPages === 0 ? 1 : result.totalPages);
                    setTotalElements(result.totalElements);
                }

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
                setError(
                    hasActiveAiQuery
                        ? "Failed to run AI search."
                        : "Failed to load marketplace posts."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchMarketplacePosts();
    }, [
        page,
        selectedGenre,
        sort,
        user,
        isAiMode,
        hasActiveAiQuery,
        activeSearchQuery,
    ]);

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

    function handleSearchModeChange(
        _: MouseEvent<HTMLElement>,
        nextMode: SearchMode | null,
    ) {
        if (!nextMode) {
            return;
        }

        setSearchMode(nextMode);
        setPage(1);
        setError("");

        if (nextMode === "browse") {
            setSearchInput("");
            setActiveSearchQuery("");
        }
    }

    function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const query = searchInput.trim();

        if (!query) {
            setActiveSearchQuery("");
            setPage(1);
            return;
        }

        setActiveSearchQuery(query);
        setPage(1);
    }

    function handleClearSearch() {
        setSearchInput("");
        setActiveSearchQuery("");
        setError("");
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
                            Browse datasets by genre, compare credit prices, or use AI
                            semantic search to describe the kind of dataset you need.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
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
                                        Discovery mode
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                        Choose normal browsing or AI semantic search.
                                    </Typography>
                                </Stack>

                                <ToggleButtonGroup
                                    exclusive
                                    size="small"
                                    value={searchMode}
                                    onChange={handleSearchModeChange}
                                    fullWidth
                                    sx={{
                                        bgcolor: "rgba(2, 6, 23, 0.42)",
                                        borderRadius: 999,
                                        p: 0.35,
                                        "& .MuiToggleButton-root": {
                                            flex: 1,
                                            border: 0,
                                            borderRadius: "999px !important",
                                            color: "#94A3B8",
                                            textTransform: "none",
                                            fontWeight: 900,
                                            "&.Mui-selected": {
                                                color: "#E0F2FE",
                                                bgcolor: "rgba(6, 182, 212, 0.16)",
                                            },
                                            "&.Mui-selected:hover": {
                                                bgcolor: "rgba(6, 182, 212, 0.22)",
                                            },
                                        },
                                    }}
                                >
                                    <ToggleButton value="browse">
                                        Browse
                                    </ToggleButton>
                                    <ToggleButton value="ai">
                                        AI Search
                                    </ToggleButton>
                                </ToggleButtonGroup>

                                {isAiMode && (
                                    <Box
                                        component="form"
                                        onSubmit={handleSearchSubmit}
                                        sx={{
                                            p: 2.25,
                                            borderRadius: 3,
                                            bgcolor: "rgba(168, 85, 247, 0.08)",
                                            border: "1px solid rgba(168, 85, 247, 0.22)",
                                        }}
                                    >
                                        <Stack spacing={1.5}>
                                            <Stack spacing={0.4}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "#D8B4FE",
                                                        fontWeight: 900,
                                                        letterSpacing: 0.7,
                                                    }}
                                                >
                                                    DESCRIBE YOUR DATASET
                                                </Typography>

                                                <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                                                    Search by meaning, not exact keywords.
                                                </Typography>
                                            </Stack>

                                            <TextField
                                                fullWidth
                                                multiline
                                                minRows={4}
                                                maxRows={7}
                                                value={searchInput}
                                                onChange={(event) => setSearchInput(event.target.value)}
                                                placeholder="Example: I need customer support conversations about refund requests, delivery delays, and complaints about damaged products."
                                                sx={{
                                                    textarea: {
                                                        color: "#FFFFFF",
                                                        lineHeight: 1.65,
                                                    },
                                                    "& .MuiOutlinedInput-root": {
                                                        alignItems: "flex-start",
                                                        borderRadius: 3,
                                                        bgcolor: "rgba(2, 6, 23, 0.5)",
                                                        "& fieldset": {
                                                            borderColor: "rgba(168, 85, 247, 0.28)",
                                                        },
                                                        "&:hover fieldset": {
                                                            borderColor: "rgba(216, 180, 254, 0.55)",
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                            borderColor: "#D8B4FE",
                                                        },
                                                    },
                                                    "& .MuiInputBase-input::placeholder": {
                                                        color: "#64748B",
                                                        opacity: 1,
                                                    },
                                                }}
                                            />

                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    type="submit"
                                                    fullWidth
                                                    disabled={!searchInput.trim()}
                                                    variant="contained"
                                                    sx={{
                                                        borderRadius: 999,
                                                        textTransform: "none",
                                                        fontWeight: 950,
                                                        bgcolor: "#7C3AED",
                                                        "&:hover": {
                                                            bgcolor: "#6D28D9",
                                                        },
                                                        "&.Mui-disabled": {
                                                            bgcolor: "rgba(148, 163, 184, 0.14)",
                                                            color: "#64748B",
                                                        },
                                                    }}
                                                >
                                                    Run AI Search
                                                </Button>

                                                {activeSearchQuery && (
                                                    <Button
                                                        type="button"
                                                        onClick={handleClearSearch}
                                                        variant="outlined"
                                                        sx={{
                                                            borderRadius: 999,
                                                            textTransform: "none",
                                                            fontWeight: 900,
                                                            color: "#E9D5FF",
                                                            borderColor: "rgba(216, 180, 254, 0.32)",
                                                            "&:hover": {
                                                                borderColor: "#D8B4FE",
                                                                bgcolor: "rgba(168, 85, 247, 0.08)",
                                                            },
                                                        }}
                                                    >
                                                        Clear
                                                    </Button>
                                                )}
                                            </Stack>

                                            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                                                AI search may call the embedding service. Later, this can
                                                consume credits or usage tokens.
                                            </Typography>
                                        </Stack>
                                    </Box>
                                )}

                                <Stack spacing={0.5}>
                                    <Typography sx={{ fontWeight: 950, color: "#FFFFFF" }}>
                                        {isAiMode ? "AI filters" : "Browse filters"}
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                        {isAiMode
                                            ? "Filter and sort the semantic matches returned by AI."
                                            : "Narrow the marketplace by genre and sort order."}
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
                                        bgcolor: isAiMode
                                            ? "rgba(168, 85, 247, 0.08)"
                                            : "rgba(6, 182, 212, 0.08)",
                                        border: isAiMode
                                            ? "1px solid rgba(168, 85, 247, 0.18)"
                                            : "1px solid rgba(6, 182, 212, 0.18)",
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: isAiMode ? "#D8B4FE" : "#67E8F9",
                                            fontWeight: 900,
                                            letterSpacing: 0.7,
                                        }}
                                    >
                                        {isAiMode ? "AI MATCHES" : "RESULT COUNT"}
                                    </Typography>

                                    <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                        {totalElements} {isAiMode ? "matches" : "datasets"}
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
                                    {isAiMode
                                        ? "AI semantic search"
                                        : "Marketplace listings"}
                                </Typography>

                                <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.5 }}>
                                    {isAiMode
                                        ? activeSearchQuery
                                            ? `Semantic matches for "${activeSearchQuery}"`
                                            : "Enter a description to search datasets by meaning."
                                        : `Page ${page} of ${totalPages}`}
                                </Typography>
                            </Box>

                            <Chip
                                label={
                                    isAiMode
                                        ? "AI Search"
                                        : selectedGenre === "ALL"
                                            ? "All genres"
                                            : formatGenre(selectedGenre)
                                }
                                sx={{
                                    width: "fit-content",
                                    bgcolor: isAiMode
                                        ? "rgba(168, 85, 247, 0.14)"
                                        : "rgba(37, 99, 235, 0.14)",
                                    color: isAiMode ? "#E9D5FF" : "#BFDBFE",
                                    border: isAiMode
                                        ? "1px solid rgba(168, 85, 247, 0.24)"
                                        : "1px solid rgba(37, 99, 235, 0.24)",
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
                                            {isAiMode && !activeSearchQuery
                                                ? "Start an AI search"
                                                : "No datasets found"}
                                        </Typography>

                                        <Typography sx={{ color: "#94A3B8" }}>
                                            {isAiMode && !activeSearchQuery
                                                ? "Describe the dataset you want, then run AI Search."
                                                : isAiMode
                                                    ? "Try a broader AI search query or adjust the filters."
                                                    : "Try selecting another genre or changing the sort option."}
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
                                    const qualityTotal = post.qualityRating?.total;
                                    const hasQualityRating = typeof qualityTotal === "number";

                                    const qualityChipStyle =
                                        !hasQualityRating
                                            ? {
                                                bgcolor: "rgba(100, 116, 139, 0.12)",
                                                color: "#CBD5E1",
                                                border: "1px solid rgba(148, 163, 184, 0.22)",
                                            }
                                            : qualityTotal >= 80
                                                ? {
                                                    bgcolor: "rgba(34, 197, 94, 0.12)",
                                                    color: "#BBF7D0",
                                                    border: "1px solid rgba(34, 197, 94, 0.24)",
                                                }
                                                : qualityTotal >= 60
                                                    ? {
                                                        bgcolor: "rgba(245, 158, 11, 0.12)",
                                                        color: "#FDE68A",
                                                        border: "1px solid rgba(245, 158, 11, 0.24)",
                                                    }
                                                    : {
                                                        bgcolor: "rgba(239, 68, 68, 0.12)",
                                                        color: "#FECACA",
                                                        border: "1px solid rgba(239, 68, 68, 0.24)",
                                                    };

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

                                                            <Chip
                                                                label={
                                                                    hasQualityRating
                                                                        ? `Quality ${qualityTotal.toFixed(1)}%`
                                                                        : "Not rated"
                                                                }
                                                                size="small"
                                                                sx={{
                                                                    ...qualityChipStyle,
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

                        {!loading && !error && !isAiMode && totalPages > 1 && (
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