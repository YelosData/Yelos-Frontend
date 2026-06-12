import { useEffect, useState, type ChangeEvent } from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Pagination,
    Stack,
    Typography,
} from "@mui/material";
import type { DataPostDetail, Genre } from "../types/post";
import { getPostsByUserId } from "../api/post";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 6;

function formatGenre(genre: Genre | string): string {
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
                            View the datasets you have listed online.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 720,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            See the full details of every dataset you have posted to the
                            marketplace. This is a read-only view, so there are no edit or
                            delete actions here.
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
                                                        Listed {formatDate(post.createdAt)}
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
        </Box>
    );
}