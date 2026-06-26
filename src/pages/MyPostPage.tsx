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
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    MenuItem,
    Pagination,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type { DataPostDetail, Genre } from "../types/post";
import { deletePost, getPostsByUserId, updatePost } from "../api/post";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 6;

const genreOptions: Array<{ label: string; value: Genre }> = [
    { label: "Education", value: "EDUCATION" },
    { label: "Customer Support", value: "CUSTOMER_SUPPORT" },
    { label: "Finance", value: "FINANCE" },
    { label: "Coding", value: "CODING" },
    { label: "Health & Wellness", value: "HEALTH_WELLNESS" },
    { label: "Travel", value: "TRAVEL" },
    { label: "Other", value: "OTHER" },
];

const textFieldSx = {
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
    "& .MuiSvgIcon-root": {
        color: "#CBD5E1",
    },
};

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

export default function MyPostsPage() {
    const { user } = useAuth();

    const [posts, setPosts] = useState<DataPostDetail[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<DataPostDetail | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editSummary, setEditSummary] = useState("");
    const [editGenre, setEditGenre] = useState<Genre>("EDUCATION");
    const [editPrice, setEditPrice] = useState("");
    const [editFile, setEditFile] = useState<File | null>(null);
    const [actionError, setActionError] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchMyPosts() {
            if (!user?.id) {
                setPosts([]);
                setTotalPages(1);
                setTotalElements(0);
                setError("You must be logged in to view your posted datasets.");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const result = await getPostsByUserId(user.id, page - 1, PAGE_SIZE);

                setPosts(Array.isArray(result.content) ? result.content : []);
                setTotalPages(result.totalPages === 0 ? 1 : result.totalPages);
                setTotalElements(result.totalElements);
            } catch (err) {
                console.error(err);
                setError("Failed to load your posted datasets.");
                setPosts([]);
                setTotalPages(1);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        }

        fetchMyPosts();
    }, [user?.id, page]);

    function handlePageChange(_: ChangeEvent<unknown>, nextPage: number) {
        setPage(nextPage);
    }

    function openEditDialog(post: DataPostDetail) {
        setSelectedPost(post);
        setEditTitle(post.title);
        setEditSummary(post.summary);
        setEditGenre(post.genre);
        setEditPrice(String(post.price));
        setEditFile(null);
        setActionError("");
        setEditOpen(true);
    }

    function closeEditDialog() {
        if (saving) return;

        setEditOpen(false);
        setSelectedPost(null);
        setEditFile(null);
        setActionError("");
    }

    async function handleUpdatePost(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!user?.id || !selectedPost) return;

        const cleanedTitle = editTitle.trim();
        const cleanedSummary = editSummary.trim();
        const numericPrice = Number(editPrice);

        if (!cleanedTitle || !cleanedSummary) {
            setActionError("Title and summary are required.");
            return;
        }

        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            setActionError("Price must be greater than 0.");
            return;
        }

        try {
            setSaving(true);
            setActionError("");

            const updatedPost = await updatePost({
                postId: selectedPost.id,
                userId: user.id,
                title: cleanedTitle,
                summary: cleanedSummary,
                genre: editGenre,
                price: numericPrice,
                file: editFile,
            });

            setPosts((currentPosts) =>
                currentPosts.map((post) =>
                    post.id === updatedPost.id ? updatedPost : post
                )
            );

            closeEditDialog();
        } catch (err) {
            console.error(err);
            setActionError("Failed to update post.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDeletePost(postId: number) {
        if (!user?.id) return;

        const confirmed = window.confirm(
            "Delete this listing? Buyers who already purchased it will keep their purchase history."
        );

        if (!confirmed) return;

        try {
            setDeletingId(postId);
            setActionError("");

            await deletePost(postId, user.id);

            setPosts((currentPosts) =>
                currentPosts.filter((post) => post.id !== postId)
            );

            setTotalElements((currentTotal) => Math.max(currentTotal - 1, 0));
        } catch (err) {
            console.error(err);
            setActionError("Failed to delete post.");
        } finally {
            setDeletingId(null);
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
                            label="My Posts"
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
                            Manage the datasets you have listed online.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 720,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            Update listing details, replace dataset files, or remove old listings from the
                            marketplace. Replacing the file creates a new dataset version.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
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
                                sx={{
                                    color: "#FFFFFF",
                                    fontWeight: 950,
                                }}
                            >
                                Posted datasets
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#94A3B8",
                                    mt: 0.5,
                                }}
                            >
                                {totalElements} dataset{totalElements === 1 ? "" : "s"} posted
                            </Typography>
                        </Box>

                        <Chip
                            label={`Page ${page} of ${totalPages}`}
                            sx={{
                                width: "fit-content",
                                bgcolor: "rgba(37, 99, 235, 0.14)",
                                color: "#BFDBFE",
                                border: "1px solid rgba(37, 99, 235, 0.24)",
                                fontWeight: 900,
                            }}
                        />
                    </Box>

                    {actionError && !editOpen && <Alert severity="error">{actionError}</Alert>}

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
                                        You have not posted any datasets yet
                                    </Typography>

                                    <Typography sx={{ color: "#94A3B8" }}>
                                        Once you create a marketplace listing, it will appear here.
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
                                                        Listed {formatDate(post.createdAt)} · Updated{" "}
                                                        {formatDate(post.updatedAt)}
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
                                                        label={`Version ${post.version ?? 1}`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: "rgba(14, 165, 233, 0.12)",
                                                            color: "#BAE6FD",
                                                            border: "1px solid rgba(14, 165, 233, 0.24)",
                                                            fontWeight: 900,
                                                        }}
                                                    />
                                                </Stack>
                                            </Box>


                                            <Stack // NEW
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={1.2}
                                                sx={{ justifyContent: "flex-end" }}
                                            >
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => openEditDialog(post)}
                                                    sx={{
                                                        borderRadius: 999,
                                                        textTransform: "none",
                                                        fontWeight: 900,
                                                        color: "#E0F2FE",
                                                        borderColor: "rgba(125, 211, 252, 0.35)",
                                                    }}
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    disabled={deletingId === post.id}
                                                    onClick={() => handleDeletePost(post.id)}
                                                    sx={{
                                                        borderRadius: 999,
                                                        textTransform: "none",
                                                        fontWeight: 900,
                                                        color: "#FECACA",
                                                        borderColor: "rgba(248, 113, 113, 0.35)",
                                                    }}
                                                >
                                                    {deletingId === post.id ? "Deleting..." : "Delete"}
                                                </Button>
                                            </Stack>

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
                                                    <Stack spacing={0.8}>
                                                        <Typography sx={{ color: "#E2E8F0", fontWeight: 900 }}>
                                                            {post.fileName || "Dataset file"}
                                                        </Typography>

                                                        <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                                            {post.fileType || "Unknown file type"} ·{" "}
                                                            {formatFileSize(post.fileSize)}
                                                        </Typography>

                                                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                                                            This file is stored privately in cloud storage. Buyers can only
                                                            download it after purchasing the dataset.
                                                        </Typography>
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
                                                        GENRE
                                                    </Typography>

                                                    <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                                        {formatGenre(post.genre)}
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
                                                        PRICE
                                                    </Typography>

                                                    <Typography sx={{ mt: 0.3, fontWeight: 950 }}>
                                                        {post.price} credits
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
            </Container>

            <Dialog
                open={editOpen}
                onClose={closeEditDialog}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            bgcolor: "#0F172A",
                            color: "#FFFFFF",
                            borderRadius: 3,
                            border: "1px solid rgba(148, 163, 184, 0.18)",
                        },
                    },
                }}
            >
                <Box component="form" onSubmit={handleUpdatePost}>
                    <DialogTitle sx={{ fontWeight: 950 }}>Edit listing</DialogTitle>

                    <DialogContent>
                        <Stack spacing={2.2} sx={{ mt: 1 }}>
                            {actionError && <Alert severity="error">{actionError}</Alert>}

                            <TextField
                                label="Title"
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.target.value)}
                                fullWidth
                                sx={textFieldSx}
                            />

                            <TextField
                                label="Summary"
                                value={editSummary}
                                onChange={(event) => setEditSummary(event.target.value)}
                                fullWidth
                                multiline
                                minRows={3}
                                sx={textFieldSx}
                            />

                            <TextField
                                select
                                label="Genre"
                                value={editGenre}
                                onChange={(event) => setEditGenre(event.target.value as Genre)}
                                fullWidth
                                sx={textFieldSx}
                            >
                                {genreOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Price"
                                type="number"
                                value={editPrice}
                                onChange={(event) => setEditPrice(event.target.value)}
                                fullWidth
                                sx={textFieldSx}
                                slotProps={{
                                    htmlInput: {
                                        min: 0,
                                        step: "0.01",
                                    },
                                }}
                            />

                            <Button
                                variant="outlined"
                                component="label"
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 900,
                                    color: "#E0F2FE",
                                    borderColor: "rgba(125, 211, 252, 0.35)",
                                    justifyContent: "flex-start",
                                    py: 1.2,
                                }}
                            >
                                {editFile ? editFile.name : "Replace dataset file optional"}
                                <input
                                    hidden
                                    type="file"
                                    accept=".csv,.json,.txt"
                                    onChange={(event) => setEditFile(event.target.files?.[0] ?? null)}
                                />
                            </Button>

                            <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                Replacing the file will increase the dataset version. Editing title,
                                summary, genre, or price will not.
                            </Typography>
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={closeEditDialog}
                            disabled={saving}
                            sx={{ textTransform: "none", fontWeight: 900 }}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saving}
                            sx={{
                                borderRadius: 999,
                                textTransform: "none",
                                fontWeight: 900,
                                bgcolor: "#2563EB",
                            }}
                        >
                            {saving ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}