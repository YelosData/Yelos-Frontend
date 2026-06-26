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
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
    downloadAdminPostFile,
    getUnreviewedActivePosts,
    reviewPost,
} from "../api/admin";
import type { AdminDataPost, AdminReviewStatus } from "../types/admin";
import type { Genre, SortOption } from "../types/post";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 6;

const sortOptions: Array<{ label: string; value: SortOption }> = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Price: Low to High", value: "priceAsc" },
    { label: "Price: High to Low", value: "priceDesc" },
];

function formatGenre(genre: Genre | string): string {
    return genre
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-SG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatFileSize(sizeInBytes: number | null | undefined): string {
    if (sizeInBytes == null) {
        return "Unknown size";
    }

    if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
    }

    if (sizeInBytes < 1024 * 1024) {
        return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }

    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminDashboardPage() {
    const { user } = useAuth();

    const [posts, setPosts] = useState<AdminDataPost[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [sort, setSort] = useState<SortOption>("newest");
    const [notes, setNotes] = useState<Record<number, string>>({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [actionPostId, setActionPostId] = useState<number | null>(null);
    const [downloadLoadingId, setDownloadLoadingId] = useState<number | null>(null);

    const isAdmin = user?.role === "ADMIN";

    useEffect(() => {
        async function fetchUnreviewedPosts() {
            if (!user?.id) {
                setPosts([]);
                setTotalPages(1);
                setTotalElements(0);
                setError("You must be logged in to view this page.");
                return;
            }

            if (!isAdmin) {
                setPosts([]);
                setTotalPages(1);
                setTotalElements(0);
                setError("Only admin users can view this dashboard.");
                return;
            }

            try {
                setLoading(true);
                setError("");
                setSuccess("");

                const result = await getUnreviewedActivePosts({
                    page: page - 1,
                    size: PAGE_SIZE,
                    sort,
                });

                setPosts(Array.isArray(result.content) ? result.content : []);
                setTotalPages(result.totalPages === 0 ? 1 : result.totalPages);
                setTotalElements(result.totalElements);
            } catch (err) {
                console.error(err);
                setError("Failed to load unreviewed posts.");
                setPosts([]);
                setTotalPages(1);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        }

        fetchUnreviewedPosts();
    }, [user?.id, isAdmin, page, sort]);

    function handleSortChange(event: SelectChangeEvent) {
        setSort(event.target.value as SortOption);
        setPage(1);
    }

    function handlePageChange(_: ChangeEvent<unknown>, nextPage: number) {
        setPage(nextPage);
    }

    function updateNote(postId: number, note: string) {
        setNotes((current) => ({
            ...current,
            [postId]: note,
        }));
    }

    async function handleDownload(postId: number) {
        if (!user?.id) return;

        try {
            setDownloadLoadingId(postId);
            setError("");
            setSuccess("");

            const result = await downloadAdminPostFile(postId, user.id);

            window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
        } catch (err) {
            console.error(err);
            setError("Failed to generate admin download link.");
        } finally {
            setDownloadLoadingId(null);
        }
    }

    async function handleReview(postId: number, status: AdminReviewStatus) {
        if (!user?.id) return;

        const actionText =
            status === "ACTIVE"
                ? "mark this post as reviewed"
                : "hide this post from the marketplace";

        const confirmed = window.confirm(`Are you sure you want to ${actionText}?`);

        if (!confirmed) return;

        try {
            setActionPostId(postId);
            setError("");
            setSuccess("");

            await reviewPost({
                postId,
                adminId: user.id,
                status,
                note: notes[postId]?.trim() || undefined,
            });

            setPosts((currentPosts) =>
                currentPosts.filter((post) => post.id !== postId)
            );

            setTotalElements((currentTotal) => Math.max(currentTotal - 1, 0));

            setSuccess(
                status === "ACTIVE"
                    ? "Post marked as reviewed."
                    : "Post hidden from marketplace."
            );
        } catch (err) {
            console.error(err);
            setError("Failed to update post review status.");
        } finally {
            setActionPostId(null);
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
                            label="Admin Dashboard"
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
                            Review active marketplace listings.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 760,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            Vet unreviewed seller datasets by downloading the uploaded file,
                            adding an optional admin note, then marking the listing as reviewed
                            or hiding it from the marketplace.
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
                                        Review Queue
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                        These are active posts that have not been reviewed by an admin.
                                    </Typography>
                                </Stack>

                                <FormControl fullWidth>
                                    <InputLabel
                                        id="admin-sort-select-label"
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
                                        labelId="admin-sort-select-label"
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
                                        WAITING FOR REVIEW
                                    </Typography>

                                    <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                        {totalElements} post{totalElements === 1 ? "" : "s"}
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
                                        CURRENT MODE
                                    </Typography>

                                    <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                        Manual review
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
                                    Unreviewed active posts
                                </Typography>

                                <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.5 }}>
                                    Page {page} of {totalPages}
                                </Typography>
                            </Box>

                            <Chip
                                label={isAdmin ? "Admin access" : "Restricted"}
                                sx={{
                                    width: "fit-content",
                                    bgcolor: isAdmin
                                        ? "rgba(22, 163, 74, 0.14)"
                                        : "rgba(127, 29, 29, 0.18)",
                                    color: isAdmin ? "#BBF7D0" : "#FECACA",
                                    border: isAdmin
                                        ? "1px solid rgba(74, 222, 128, 0.24)"
                                        : "1px solid rgba(248, 113, 113, 0.28)",
                                    fontWeight: 900,
                                }}
                            />
                        </Box>

                        {error && (
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
                                            No posts waiting for review
                                        </Typography>

                                        <Typography sx={{ color: "#94A3B8" }}>
                                            New active seller listings that have not been reviewed will appear here.
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}

                        {!loading && !error && posts.length > 0 && (
                            <Stack spacing={3}>
                                {posts.map((post) => (
                                    <Card
                                        key={post.id}
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
                                                            {post.title}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: "#64748B",
                                                                mt: 0.8,
                                                            }}
                                                        >
                                                            Posted by {post.username} · Listed {formatDate(post.createdAt)}
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
                                                            label={`${post.price} credits`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: "rgba(37, 99, 235, 0.14)",
                                                                color: "#BFDBFE",
                                                                border: "1px solid rgba(37, 99, 235, 0.24)",
                                                                fontWeight: 900,
                                                            }}
                                                        />

                                                        <Chip
                                                            label="Unreviewed"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: "rgba(245, 158, 11, 0.12)",
                                                                color: "#FDE68A",
                                                                border: "1px solid rgba(245, 158, 11, 0.28)",
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
                                                        {post.summary}
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
                                                                    {post.fileName || "Dataset file"}
                                                                </Typography>

                                                                <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                                                    {post.fileType || "Unknown file type"} ·{" "}
                                                                    {formatFileSize(post.fileSize)}
                                                                </Typography>

                                                                <Typography variant="caption" sx={{ color: "#64748B" }}>
                                                                    Download the private uploaded file to inspect it before reviewing.
                                                                </Typography>
                                                            </Stack>

                                                            <Button
                                                                variant="contained"
                                                                disabled={downloadLoadingId === post.id}
                                                                onClick={() => handleDownload(post.id)}
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
                                                                {downloadLoadingId === post.id ? "Preparing..." : "Download"}
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                </Box>

                                                <TextField
                                                    label="Admin note optional"
                                                    value={notes[post.id] ?? ""}
                                                    onChange={(event) => updateNote(post.id, event.target.value)}
                                                    fullWidth
                                                    multiline
                                                    minRows={2}
                                                    sx={{
                                                        "& .MuiInputBase-input": {
                                                            color: "#FFFFFF",
                                                        },
                                                        "& .MuiInputLabel-root": {
                                                            color: "#94A3B8",
                                                        },
                                                        "& .MuiInputLabel-root.Mui-focused": {
                                                            color: "#67E8F9",
                                                        },
                                                        "& .MuiOutlinedInput-root": {
                                                            "& fieldset": {
                                                                borderColor: "rgba(148, 163, 184, 0.28)",
                                                            },
                                                            "&:hover fieldset": {
                                                                borderColor: "rgba(125, 211, 252, 0.48)",
                                                            },
                                                            "&.Mui-focused fieldset": {
                                                                borderColor: "#67E8F9",
                                                            },
                                                        },
                                                    }}
                                                />

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
                                                            {post.id}
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
                                                            {post.userId}
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
                                                            VERSION
                                                        </Typography>

                                                        <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                                            {post.version ?? 1}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Stack
                                                    direction={{ xs: "column", sm: "row" }}
                                                    spacing={1.2}
                                                    sx={{ justifyContent: "flex-end" }}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        disabled={actionPostId === post.id}
                                                        onClick={() => handleReview(post.id, "ACTIVE")}
                                                        sx={{
                                                            borderRadius: 999,
                                                            textTransform: "none",
                                                            fontWeight: 900,
                                                            bgcolor: "#2563EB",
                                                            boxShadow: "0 14px 34px rgba(37, 99, 235, 0.34)",
                                                            "&:hover": {
                                                                bgcolor: "#1D4ED8",
                                                            },
                                                        }}
                                                    >
                                                        {actionPostId === post.id
                                                            ? "Updating..."
                                                            : "Mark reviewed"}
                                                    </Button>

                                                    <Button
                                                        variant="outlined"
                                                        disabled={actionPostId === post.id}
                                                        onClick={() => handleReview(post.id, "DELETED")}
                                                        sx={{
                                                            borderRadius: 999,
                                                            textTransform: "none",
                                                            fontWeight: 900,
                                                            color: "#FECACA",
                                                            borderColor: "rgba(248, 113, 113, 0.35)",
                                                            "&:hover": {
                                                                borderColor: "#FCA5A5",
                                                                bgcolor: "rgba(248, 113, 113, 0.08)",
                                                            },
                                                        }}
                                                    >
                                                        Hide listing
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
                </Box>
            </Container>
        </Box>
    );
}