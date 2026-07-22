import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
    LinearProgress,
    Stack,
    Typography,
} from "@mui/material";
import { getDataPostById } from "../api/post";
import type { DataPostDetail, Genre } from "../types/post";
import { useAuth } from "../hooks/useAuth";
import { getPurchasesByUser, purchasePost } from "../api/purchase";

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

export default function PostDetailsPage() {
    const navigate = useNavigate();
    const { postId } = useParams();
    const { user, updateCredits } = useAuth();

    const [post, setPost] = useState<DataPostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [error, setError] = useState("");
    const [purchaseMessage, setPurchaseMessage] = useState("");
    const [alreadyPurchased, setAlreadyPurchased] = useState(false);

    const numericPostId = Number(postId);

    useEffect(() => {
        async function fetchPostAndPurchaseStatus() {
            if (!postId || !Number.isFinite(numericPostId)) {
                setError("Invalid post id.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const postResult = await getDataPostById(numericPostId);
                setPost(postResult);

                if (user?.role === "BUSINESS") {
                    const purchases = await getPurchasesByUser(user.id);

                    const hasPurchased = purchases.some(
                        (purchase) => purchase.postId === numericPostId
                    );

                    setAlreadyPurchased(hasPurchased);
                } else {
                    setAlreadyPurchased(false);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load post details.");
            } finally {
                setLoading(false);
            }
        }

        fetchPostAndPurchaseStatus();
    }, [postId, numericPostId, user]);

    async function handlePurchase() {
        if (!post) {
            return;
        }

        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role !== "BUSINESS") {
            setPurchaseMessage("Only business accounts can purchase marketplace posts.");
            return;
        }

        if (user.id === post.userId) {
            setPurchaseMessage("You cannot purchase your own listing.");
            return;
        }

        try {
            setPurchaseLoading(true);
            setPurchaseMessage("");

            const purchase = await purchasePost({
                buyerId: user.id,
                postId: post.id,
            });

            updateCredits(purchase.buyerCredits);
            setAlreadyPurchased(true);
            setPurchaseMessage("Purchase successful. This dataset has been added to your purchases.");

            console.log("Purchase response:", purchase);
        } catch (err) {
            console.error(err);
            setPurchaseMessage("Purchase failed. Check your credits or backend logs.");
        } finally {
            setPurchaseLoading(false);
        }
    }

    const isOwner = Boolean(user && post && user.id === post.userId);
    const canPurchase = Boolean(user && user.role === "BUSINESS" && post && !isOwner);

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    bgcolor: "#020617",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                }}
            >
                <Stack spacing={2} sx={{ alignItems: "center" }}>
                    <CircularProgress sx={{ color: "#67E8F9" }} />
                    <Typography sx={{ color: "#CBD5E1" }}>
                        Loading dataset details...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    if (error || !post) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    bgcolor: "#020617",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                    py: 6,
                }}
            >
                <Card
                    elevation={0}
                    sx={{
                        maxWidth: 560,
                        width: "100%",
                        bgcolor: "rgba(15, 23, 42, 0.88)",
                        color: "#FFFFFF",
                        border: "1px solid rgba(248, 113, 113, 0.24)",
                        borderRadius: 4,
                        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.32)",
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Stack spacing={2.5}>
                            <Chip
                                label="Post unavailable"
                                sx={{
                                    width: "fit-content",
                                    bgcolor: "rgba(220, 38, 38, 0.14)",
                                    color: "#FECACA",
                                    border: "1px solid rgba(248, 113, 113, 0.24)",
                                    fontWeight: 900,
                                }}
                            />

                            <Typography variant="h4" sx={{ fontWeight: 950 }}>
                                Could not load this post.
                            </Typography>

                            <Typography sx={{ color: "#94A3B8", lineHeight: 1.7 }}>
                                {error || "The requested marketplace listing could not be found."}
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={() => navigate("/marketplace")}
                                sx={{
                                    width: "fit-content",
                                    borderRadius: 999,
                                    textTransform: "none",
                                    fontWeight: 900,
                                    bgcolor: "#2563EB",
                                    "&:hover": {
                                        bgcolor: "#1D4ED8",
                                    },
                                }}
                            >
                                Back to marketplace
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const qualityTotal = post.qualityRating?.total ?? null;

    const qualityMetrics = post.qualityRating
        ? [
            { label: "Completeness", value: post.qualityRating.completeness },
            { label: "Consistency", value: post.qualityRating.consistency },
            { label: "Uniqueness", value: post.qualityRating.uniqueness },
            { label: "Validity", value: post.qualityRating.validity },
            { label: "Richness", value: post.qualityRating.richness },
        ]
        : [];

    const qualityChipStyle =
        qualityTotal == null
            ? {
                bgcolor: "rgba(100, 116, 139, 0.14)",
                color: "#CBD5E1",
                border: "1px solid rgba(148, 163, 184, 0.24)",
            }
            : qualityTotal >= 80
                ? {
                    bgcolor: "rgba(22, 163, 74, 0.14)",
                    color: "#BBF7D0",
                    border: "1px solid rgba(74, 222, 128, 0.26)",
                }
                : qualityTotal >= 60
                    ? {
                        bgcolor: "rgba(202, 138, 4, 0.14)",
                        color: "#FDE68A",
                        border: "1px solid rgba(250, 204, 21, 0.26)",
                    }
                    : {
                        bgcolor: "rgba(220, 38, 38, 0.14)",
                        color: "#FECACA",
                        border: "1px solid rgba(248, 113, 113, 0.26)",
                    };

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
                        py: { xs: 5, md: 7 },
                    }}
                >
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1.2} sx={{ flexWrap: "wrap" }}>
                            <Chip
                                label={formatGenre(post.genre)}
                                sx={{
                                    width: "fit-content",
                                    bgcolor: "rgba(6, 182, 212, 0.12)",
                                    color: "#A5F3FC",
                                    border: "1px solid rgba(6, 182, 212, 0.26)",
                                    fontWeight: 900,
                                    letterSpacing: 0.2,
                                }}
                            />

                            <Chip
                                label={
                                    qualityTotal == null
                                        ? "Not rated"
                                        : `Quality ${qualityTotal.toFixed(1)}%`
                                }
                                sx={{
                                    width: "fit-content",
                                    ...qualityChipStyle,
                                    fontWeight: 900,
                                }}
                            />

                            {isOwner && (
                                <Chip
                                    label="Your listing"
                                    sx={{
                                        width: "fit-content",
                                        bgcolor: "rgba(37, 99, 235, 0.16)",
                                        color: "#BFDBFE",
                                        border: "1px solid rgba(37, 99, 235, 0.26)",
                                        fontWeight: 900,
                                    }}
                                />
                            )}

                            {post.adminReviewed && (
                                <Chip
                                    label="Admin reviewed"
                                    sx={{
                                        width: "fit-content",
                                        bgcolor: "rgba(34, 197, 94, 0.12)",
                                        color: "#BBF7D0",
                                        border: "1px solid rgba(34, 197, 94, 0.24)",
                                        fontWeight: 900,
                                    }}
                                />
                            )}
                        </Stack>

                        <Typography
                            variant="h2"
                            sx={{
                                color: "#FFFFFF",
                                fontWeight: 950,
                                letterSpacing: "-0.055em",
                                lineHeight: 1,
                                fontSize: { xs: "2.2rem", md: "3.7rem" },
                                maxWidth: 850,
                            }}
                        >
                            {post.title || `${formatGenre(post.genre)} Dataset`}
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 340px" },
                        gap: 3,
                    }}
                >
                    <Stack spacing={3}>
                        <Card
                            elevation={0}
                            sx={{
                                bgcolor: "rgba(15, 23, 42, 0.82)",
                                color: "#FFFFFF",
                                border: "1px solid rgba(148, 163, 184, 0.18)",
                                borderRadius: 4,
                                boxShadow: "0 24px 70px rgba(0, 0, 0, 0.22)",
                            }}
                        >
                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                <Stack spacing={2.5}>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 950 }}>
                                            AI summary
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.6 }}>
                                            This summary is generated from the uploaded dataset.
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.16)" }} />

                                    <Box
                                        sx={{
                                            p: { xs: 2, md: 3 },
                                            borderRadius: 3,
                                            bgcolor: "rgba(2, 6, 23, 0.48)",
                                            border: "1px solid rgba(148, 163, 184, 0.16)",
                                            overflow: "auto",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: "#CBD5E1",
                                                lineHeight: 1.75,
                                                fontSize: "0.98rem",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {post.summary || "No summary available."}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card
                            elevation={0}
                            sx={{
                                bgcolor: "rgba(15, 23, 42, 0.82)",
                                color: "#FFFFFF",
                                border: "1px solid rgba(148, 163, 184, 0.18)",
                                borderRadius: 4,
                                boxShadow: "0 24px 70px rgba(0, 0, 0, 0.22)",
                            }}
                        >
                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                <Stack spacing={2.5}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: { xs: "column", sm: "row" },
                                            justifyContent: "space-between",
                                            alignItems: { xs: "flex-start", sm: "center" },
                                            gap: 1.5,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 950 }}>
                                                Dataset quality
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{ color: "#94A3B8", mt: 0.6 }}
                                            >
                                                Automated checks for dataset completeness and usability.
                                            </Typography>
                                        </Box>

                                        <Chip
                                            label={
                                                qualityTotal == null
                                                    ? "Not rated"
                                                    : `${qualityTotal.toFixed(1)}% overall`
                                            }
                                            sx={{
                                                ...qualityChipStyle,
                                                fontWeight: 950,
                                                fontSize: "0.95rem",
                                            }}
                                        />
                                    </Box>

                                    <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.16)" }} />

                                    {qualityMetrics.length > 0 ? (
                                        <Stack spacing={2}>
                                            {qualityMetrics.map((metric) => {
                                                const value = metric.value ?? 0;

                                                return (
                                                    <Box key={metric.label}>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                gap: 2,
                                                                mb: 0.8,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ color: "#CBD5E1", fontWeight: 800 }}
                                                            >
                                                                {metric.label}
                                                            </Typography>

                                                            <Typography
                                                                variant="body2"
                                                                sx={{ color: "#E2E8F0", fontWeight: 900 }}
                                                            >
                                                                {metric.value == null
                                                                    ? "N/A"
                                                                    : `${metric.value.toFixed(1)}%`}
                                                            </Typography>
                                                        </Box>

                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={Math.min(100, Math.max(0, value))}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 999,
                                                                bgcolor: "rgba(148, 163, 184, 0.14)",
                                                                "& .MuiLinearProgress-bar": {
                                                                    borderRadius: 999,
                                                                    bgcolor:
                                                                        value >= 80
                                                                            ? "#22C55E"
                                                                            : value >= 60
                                                                                ? "#EAB308"
                                                                                : "#EF4444",
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    ) : (
                                        <Box
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 3,
                                                bgcolor: "rgba(2, 6, 23, 0.48)",
                                                border: "1px solid rgba(148, 163, 184, 0.16)",
                                            }}
                                        >
                                            <Typography sx={{ color: "#94A3B8", lineHeight: 1.7 }}>
                                                No quality rating is available for this dataset yet.
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card
                            elevation={0}
                            sx={{
                                bgcolor: "rgba(15, 23, 42, 0.82)",
                                color: "#FFFFFF",
                                border: "1px solid rgba(148, 163, 184, 0.18)",
                                borderRadius: 4,
                                boxShadow: "0 24px 70px rgba(0, 0, 0, 0.22)",
                            }}
                        >
                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                <Stack spacing={2.5}>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 950 }}>
                                            Dataset preview
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.6 }}>
                                            First few rows generated from the anonymised dataset.
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.16)" }} />

                                    <Box
                                        sx={{
                                            p: { xs: 2, md: 3 },
                                            borderRadius: 3,
                                            bgcolor: "rgba(2, 6, 23, 0.48)",
                                            border: "1px solid rgba(148, 163, 184, 0.16)",
                                            maxHeight: 360,
                                            overflow: "auto",
                                        }}
                                    >
                                        <Typography
                                            component="pre"
                                            sx={{
                                                m: 0,
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                                color: "#CBD5E1",
                                                lineHeight: 1.75,
                                                fontFamily:
                                                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                                fontSize: "0.92rem",
                                            }}
                                        >
                                            {post.previewCsv || "No preview available."}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Button
                            variant="outlined"
                            onClick={() => navigate("/marketplace")}
                            sx={{
                                width: "fit-content",
                                borderRadius: 999,
                                textTransform: "none",
                                fontWeight: 900,
                                color: "#E0F2FE",
                                borderColor: "rgba(125, 211, 252, 0.32)",
                                "&:hover": {
                                    borderColor: "#67E8F9",
                                    bgcolor: "rgba(6, 182, 212, 0.08)",
                                },
                            }}
                        >
                            Back to marketplace
                        </Button>
                    </Stack>

                    <Card
                        elevation={0}
                        sx={{
                            height: "fit-content",
                            position: { md: "sticky" },
                            top: { md: 88 },
                            bgcolor: "rgba(15, 23, 42, 0.88)",
                            color: "#FFFFFF",
                            border: "1px solid rgba(148, 163, 184, 0.18)",
                            borderRadius: 4,
                            boxShadow: "0 24px 70px rgba(0, 0, 0, 0.22)",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography sx={{ fontWeight: 950, color: "#FFFFFF" }}>
                                        Purchase listing
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.6 }}>
                                        Review seller, price, and access rules before purchasing.
                                    </Typography>
                                </Box>

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
                                        PRICE
                                    </Typography>

                                    <Typography sx={{ mt: 0.3, fontWeight: 950, fontSize: "1.5rem" }}>
                                        {post.price} credits
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ color: "#64748B" }}>
                                        Seller
                                    </Typography>

                                    <Typography sx={{ color: "#CBD5E1", fontWeight: 900 }}>
                                        {post.username}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ color: "#64748B" }}>
                                        Listed
                                    </Typography>

                                    <Typography sx={{ color: "#CBD5E1", fontWeight: 900 }}>
                                        {formatDate(post.createdAt)}
                                    </Typography>
                                </Box>

                                {user && (
                                    <Box>
                                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                                            Your account
                                        </Typography>

                                        <Typography sx={{ color: "#CBD5E1", fontWeight: 900 }}>
                                            {user.username} · {user.role}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                            {user.credits} credits available
                                        </Typography>
                                    </Box>
                                )}

                                {purchaseMessage && (
                                    <Alert
                                        severity={
                                            purchaseMessage.toLowerCase().includes("successful")
                                                ? "success"
                                                : "info"
                                        }
                                        sx={{
                                            bgcolor: purchaseMessage.toLowerCase().includes("successful")
                                                ? "rgba(22, 163, 74, 0.14)"
                                                : "rgba(37, 99, 235, 0.14)",
                                            color: purchaseMessage.toLowerCase().includes("successful")
                                                ? "#BBF7D0"
                                                : "#BFDBFE",
                                            border: purchaseMessage.toLowerCase().includes("successful")
                                                ? "1px solid rgba(74, 222, 128, 0.24)"
                                                : "1px solid rgba(96, 165, 250, 0.24)",
                                            borderRadius: 3,
                                            "& .MuiAlert-icon": {
                                                color: purchaseMessage.toLowerCase().includes("successful")
                                                    ? "#86EFAC"
                                                    : "#93C5FD",
                                            },
                                        }}
                                    >
                                        {purchaseMessage}
                                    </Alert>
                                )}

                                {alreadyPurchased ? (
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        disabled
                                        sx={{
                                            borderRadius: 999,
                                            textTransform: "none",
                                            fontWeight: 900,
                                            "&.Mui-disabled": {
                                                color: "#BBF7D0",
                                                borderColor: "rgba(74, 222, 128, 0.34)",
                                                bgcolor: "rgba(22, 163, 74, 0.10)",
                                                opacity: 1,
                                            },
                                        }}
                                    >
                                        Already purchased
                                    </Button>
                                ) : !user ? (
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => navigate("/login")}
                                        sx={{
                                            borderRadius: 999,
                                            textTransform: "none",
                                            fontWeight: 900,
                                            bgcolor: "#2563EB",
                                            "&:hover": {
                                                bgcolor: "#1D4ED8",
                                            },
                                        }}
                                    >
                                        Login to purchase
                                    </Button>
                                ) : isOwner ? (
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate("/my-posts")}
                                        sx={{
                                            borderRadius: 999,
                                            textTransform: "none",
                                            fontWeight: 900,
                                            color: "#E0F2FE",
                                            borderColor: "rgba(125, 211, 252, 0.32)",
                                            "&:hover": {
                                                borderColor: "#67E8F9",
                                                bgcolor: "rgba(6, 182, 212, 0.08)",
                                            },
                                        }}
                                    >
                                        Manage your listing
                                    </Button>
                                ) : user.role !== "BUSINESS" ? (
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        disabled
                                        sx={{
                                            borderRadius: 999,
                                            textTransform: "none",
                                            fontWeight: 900,
                                            color: "#FFFFFF",
                                            borderColor: "rgba(255, 255, 255, 0.38)",

                                            "&.Mui-disabled": {
                                                color: "#FFFFFF",
                                                borderColor: "rgba(255, 255, 255, 0.38)",
                                                opacity: 0.75,
                                            },
                                        }}
                                    >
                                        Business accounts only
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        disabled={purchaseLoading || !canPurchase}
                                        onClick={handlePurchase}
                                        sx={{
                                            borderRadius: 999,
                                            textTransform: "none",
                                            fontWeight: 900,
                                            bgcolor: "#2563EB",
                                            boxShadow: "0 14px 34px rgba(37, 99, 235, 0.34)",
                                            "&:hover": {
                                                bgcolor: "#1D4ED8",
                                                boxShadow: "0 16px 42px rgba(37, 99, 235, 0.44)",
                                            },
                                        }}
                                    >
                                        {purchaseLoading
                                            ? "Purchasing..."
                                            : `Buy for ${post.price} credits`}
                                    </Button>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}