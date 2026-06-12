import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
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
    Stack,
    Typography,
} from "@mui/material";
import type {
    DatasetRequest,
    RequestSubmission,
    SubmissionStatus,
} from "../types/requestMarketplace";
import {
    acceptSubmission,
    downloadAcceptedSubmission,
    getRequestSubmissions,
} from "../api/requestMarketplace";
import { useAuth } from "../hooks/useAuth";

type LocationState = {
    request?: DatasetRequest;
};

function formatDate(dateString: string | null): string {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleDateString("en-SG", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDateTime(dateString: string | null): string {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleString("en-SG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatFileSize(sizeInBytes: number | null | undefined): string {
    if (sizeInBytes == null) return "Unknown size";

    if (sizeInBytes < 1024) {
        return `${sizeInBytes} B`;
    }

    if (sizeInBytes < 1024 * 1024) {
        return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }

    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatStatus(status: SubmissionStatus): string {
    return status
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

function getSubmissionStatusChipStyle(status: SubmissionStatus) {
    if (status === "PENDING") {
        return {
            bgcolor: "rgba(250, 204, 21, 0.12)",
            color: "#FEF08A",
            border: "1px solid rgba(250, 204, 21, 0.25)",
        };
    }

    if (status === "ACCEPTED") {
        return {
            bgcolor: "rgba(34, 197, 94, 0.12)",
            color: "#BBF7D0",
            border: "1px solid rgba(34, 197, 94, 0.25)",
        };
    }

    return {
        bgcolor: "rgba(248, 113, 113, 0.12)",
        color: "#FECACA",
        border: "1px solid rgba(248, 113, 113, 0.25)",
    };
}

export default function RequestDetailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { requestId } = useParams();
    const { user, updateCredits } = useAuth();

    const state = location.state as LocationState | null;

    const [request, setRequest] = useState<DatasetRequest | null>(
        state?.request ?? null
    );
    const [submissions, setSubmissions] = useState<RequestSubmission[]>([]);

    const [loading, setLoading] = useState(false);
    const [acceptingId, setAcceptingId] = useState<number | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const numericRequestId = Number(requestId);
    const isBusinessUser = user?.role === "BUSINESS";

    const acceptedSubmission = submissions.find(
        (submission) => submission.status === "ACCEPTED"
    );

    const hasAcceptedSubmission = Boolean(acceptedSubmission);

    useEffect(() => {
        async function fetchSubmissions() {
            if (!user?.id) {
                setError("You must be logged in to view request submissions.");
                return;
            }

            if (!isBusinessUser) {
                setError("Only business users can view request submissions.");
                return;
            }

            if (!numericRequestId || Number.isNaN(numericRequestId)) {
                setError("Invalid request id.");
                return;
            }

            try {
                setLoading(true);
                setError("");
                setSuccess("");

                const result = await getRequestSubmissions(
                    numericRequestId,
                    user.id
                );

                setSubmissions(Array.isArray(result) ? result : []);
            } catch (err) {
                console.error(err);
                setError("Failed to load submissions for this request.");
                setSubmissions([]);
            } finally {
                setLoading(false);
            }
        }

        fetchSubmissions();
    }, [user?.id, isBusinessUser, numericRequestId]);

    async function refreshSubmissions() {
        if (!user?.id || !numericRequestId || Number.isNaN(numericRequestId)) {
            return;
        }

        const result = await getRequestSubmissions(numericRequestId, user.id);
        setSubmissions(Array.isArray(result) ? result : []);
    }

    async function handleAcceptSubmission(submission: RequestSubmission) {
        if (!user?.id) {
            setError("You must be logged in to accept a submission.");
            return;
        }

        const confirmed = window.confirm(
            `Accept this submission for ${submission.proposedPrice} credits? This will complete the request and reject other pending submissions.`
        );

        if (!confirmed) return;

        try {
            setAcceptingId(submission.id);
            setError("");
            setSuccess("");

            await acceptSubmission(
                numericRequestId,
                submission.id,
                user.id
            );

            await refreshSubmissions();

            setRequest((prev) =>
                prev
                    ? {
                        ...prev,
                        status: "COMPLETED",
                        acceptedSubmissionId: submission.id,
                        completedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                    : prev
            );

            if (user.credits != null) {
                updateCredits(user.credits - submission.proposedPrice);
            }

            setSuccess("Submission accepted successfully. The dataset is now available for download.");
        } catch (err) {
            console.error(err);
            setError("Failed to accept submission. Please try again.");
        } finally {
            setAcceptingId(null);
        }
    }

    async function handleDownloadSubmission(submission: RequestSubmission) {
        try {
            setDownloadingId(submission.id);
            setError("");
            setSuccess("");

            const result = await downloadAcceptedSubmission(submission.id);

            window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
        } catch (err) {
            console.error(err);
            setError("Failed to generate download link. Please try again.");
        } finally {
            setDownloadingId(null);
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
                            label={`Request #${numericRequestId || "N/A"}`}
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
                            Review seller submissions.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 760,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            Compare seller messages, proposed prices, and file metadata.
                            Accepting one submission completes the request and unlocks the
                            dataset download.
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
                                Submissions
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#94A3B8",
                                    mt: 0.5,
                                }}
                            >
                                {submissions.length} submission
                                {submissions.length === 1 ? "" : "s"} received
                            </Typography>
                        </Box>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1.5}
                            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
                        >
                            {request && (
                                <Chip
                                    label={`Request status: ${request.status}`}
                                    sx={{
                                        width: "fit-content",
                                        bgcolor:
                                            request.status === "COMPLETED"
                                                ? "rgba(34, 197, 94, 0.12)"
                                                : "rgba(37, 99, 235, 0.14)",
                                        color:
                                            request.status === "COMPLETED"
                                                ? "#BBF7D0"
                                                : "#BFDBFE",
                                        border:
                                            request.status === "COMPLETED"
                                                ? "1px solid rgba(34, 197, 94, 0.25)"
                                                : "1px solid rgba(37, 99, 235, 0.26)",
                                        fontWeight: 900,
                                    }}
                                />
                            )}

                            <Button
                                variant="outlined"
                                onClick={() => navigate("/my-requests")}
                                sx={{
                                    borderRadius: 999,
                                    px: 3,
                                    py: 1,
                                    color: "#CBD5E1",
                                    borderColor: "rgba(148, 163, 184, 0.28)",
                                    fontWeight: 900,
                                    "&:hover": {
                                        borderColor: "rgba(103, 232, 249, 0.55)",
                                        bgcolor: "rgba(103, 232, 249, 0.08)",
                                    },
                                }}
                            >
                                Back to My Requests
                            </Button>
                        </Stack>
                    </Box>

                    {request && (
                        <Card
                            elevation={0}
                            sx={{
                                bgcolor: "rgba(15, 23, 42, 0.74)",
                                color: "#FFFFFF",
                                border: "1px solid rgba(148, 163, 184, 0.16)",
                                borderRadius: 4,
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                <Stack spacing={2}>
                                    <Typography sx={{ color: "#67E8F9", fontWeight: 900 }}>
                                        REQUEST SPECIFICATION
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: "#CBD5E1",
                                            lineHeight: 1.75,
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {request.specification}
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ flexWrap: "wrap", rowGap: 1 }}
                                    >
                                        <Chip
                                            label={`${request.budget} credits budget`}
                                            size="small"
                                            sx={{
                                                bgcolor: "rgba(37, 99, 235, 0.14)",
                                                color: "#BFDBFE",
                                                border: "1px solid rgba(37, 99, 235, 0.24)",
                                                fontWeight: 900,
                                            }}
                                        />

                                        <Chip
                                            label={`Created ${formatDate(request.createdAt)}`}
                                            size="small"
                                            sx={{
                                                bgcolor: "rgba(6, 182, 212, 0.12)",
                                                color: "#A5F3FC",
                                                border: "1px solid rgba(6, 182, 212, 0.22)",
                                                fontWeight: 900,
                                            }}
                                        />

                                        {request.completedAt && (
                                            <Chip
                                                label={`Completed ${formatDate(request.completedAt)}`}
                                                size="small"
                                                sx={{
                                                    bgcolor: "rgba(34, 197, 94, 0.12)",
                                                    color: "#BBF7D0",
                                                    border: "1px solid rgba(34, 197, 94, 0.25)",
                                                    fontWeight: 900,
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

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

                    {!loading && submissions.length === 0 && !error && (
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
                                        No submissions yet
                                    </Typography>

                                    <Typography sx={{ color: "#94A3B8" }}>
                                        Sellers have not submitted datasets for this request yet.
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    {!loading && submissions.length > 0 && (
                        <Stack spacing={3}>
                            {submissions.map((submission) => {
                                const canAccept =
                                    !hasAcceptedSubmission &&
                                    submission.status === "PENDING";

                                const canDownload =
                                    submission.status === "ACCEPTED";

                                return (
                                    <Card
                                        key={submission.id}
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
                                                borderColor:
                                                    submission.status === "ACCEPTED"
                                                        ? "rgba(34, 197, 94, 0.45)"
                                                        : "rgba(103, 232, 249, 0.42)",
                                                background: "rgba(15, 23, 42, 0.96)",
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                            <Stack spacing={2.5}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: {
                                                            xs: "column",
                                                            sm: "row",
                                                        },
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
                                                            Submission from{" "}
                                                            {submission.sellerUsername}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: "#64748B",
                                                                mt: 0.8,
                                                            }}
                                                        >
                                                            Submitted{" "}
                                                            {formatDateTime(
                                                                submission.submittedAt
                                                            )}
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
                                                            label={formatStatus(
                                                                submission.status
                                                            )}
                                                            size="small"
                                                            sx={{
                                                                ...getSubmissionStatusChipStyle(
                                                                    submission.status
                                                                ),
                                                                fontWeight: 900,
                                                            }}
                                                        />

                                                        <Chip
                                                            label={`${submission.proposedPrice} credits`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor:
                                                                    "rgba(37, 99, 235, 0.14)",
                                                                color: "#BFDBFE",
                                                                border:
                                                                    "1px solid rgba(37, 99, 235, 0.24)",
                                                                fontWeight: 900,
                                                            }}
                                                        />
                                                    </Stack>
                                                </Box>

                                                <Divider
                                                    sx={{
                                                        borderColor:
                                                            "rgba(148, 163, 184, 0.14)",
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
                                                        SELLER MESSAGE
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            color: "#CBD5E1",
                                                            lineHeight: 1.75,
                                                            mt: 0.8,
                                                            whiteSpace: "pre-wrap",
                                                        }}
                                                    >
                                                        {submission.message ||
                                                            "No message provided."}
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
                                                            bgcolor:
                                                                "rgba(2, 6, 23, 0.72)",
                                                            border:
                                                                "1px solid rgba(148, 163, 184, 0.14)",
                                                        }}
                                                    >
                                                        <Stack spacing={0.8}>
                                                            <Typography
                                                                sx={{
                                                                    color: "#E2E8F0",
                                                                    fontWeight: 900,
                                                                }}
                                                            >
                                                                {submission.fileName}
                                                            </Typography>

                                                            <Typography
                                                                variant="body2"
                                                                sx={{ color: "#94A3B8" }}
                                                            >
                                                                {submission.fileType} ·{" "}
                                                                {formatFileSize(
                                                                    submission.fileSize
                                                                )}
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                sx={{ color: "#64748B" }}
                                                            >
                                                                Full file access is only
                                                                available after accepting the
                                                                submission.
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                </Box>

                                                <Stack
                                                    direction={{ xs: "column", sm: "row" }}
                                                    spacing={1.5}
                                                    sx={{ justifyContent: "flex-end" }}
                                                >
                                                    {canAccept && (
                                                        <Button
                                                            variant="contained"
                                                            onClick={() =>
                                                                handleAcceptSubmission(
                                                                    submission
                                                                )
                                                            }
                                                            disabled={
                                                                acceptingId === submission.id
                                                            }
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
                                                            {acceptingId === submission.id
                                                                ? "Accepting..."
                                                                : "Accept Submission"}
                                                        </Button>
                                                    )}

                                                    {canDownload && (
                                                        <Button
                                                            variant="contained"
                                                            onClick={() =>
                                                                handleDownloadSubmission(
                                                                    submission
                                                                )
                                                            }
                                                            disabled={
                                                                downloadingId === submission.id
                                                            }
                                                            sx={{
                                                                borderRadius: 999,
                                                                px: 3,
                                                                py: 1,
                                                                bgcolor: "#16A34A",
                                                                fontWeight: 950,
                                                                "&:hover": {
                                                                    bgcolor: "#15803D",
                                                                },
                                                            }}
                                                        >
                                                            {downloadingId === submission.id
                                                                ? "Generating Link..."
                                                                : "Download Dataset"}
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}