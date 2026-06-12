import { useState, type FormEventHandler } from "react";
import { useNavigate } from "react-router";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type { Genre } from "../types/post";
import { createDatasetRequest } from "../api/requestMarketplace";
import { useAuth } from "../hooks/useAuth";

const GENRES: Genre[] = [
    "EDUCATION",
    "CUSTOMER_SUPPORT",
    "FINANCE",
    "CODING",
    "HEALTH_WELLNESS",
    "TRAVEL",
    "OTHER",
];

function formatGenre(genre: Genre): string {
    return genre
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");
}

export default function CreateRequestPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [genre, setGenre] = useState<Genre>("CODING");
    const [specification, setSpecification] = useState("");
    const [budget, setBudget] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isBusinessUser = user?.role === "BUSINESS";

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        if (!user?.id) {
            setError("You must be logged in to create a request.");
            return;
        }

        if (!isBusinessUser) {
            setError("Only business users can create dataset requests.");
            return;
        }

        if (!specification.trim()) {
            setError("Please describe the dataset you need.");
            return;
        }

        const parsedBudget = Number(budget);

        if (!budget || Number.isNaN(parsedBudget) || parsedBudget <= 0) {
            setError("Budget must be greater than 0.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await createDatasetRequest({
                buyerId: user.id,
                genre,
                specification: specification.trim(),
                budget: parsedBudget,
            });

            setSuccess("Request created successfully.");

            setTimeout(() => {
                navigate("/my-requests");
            }, 500);
        } catch (err) {
            console.error(err);
            setError("Failed to create request. Please try again.");
        } finally {
            setLoading(false);
        }
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
                        py: { xs: 6, md: 8 },
                    }}
                >
                    <Stack spacing={2}>
                        <Chip
                            label="Create Request"
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
                            Request a custom dataset from sellers.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 720,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            Describe the dataset you need, set your budget, and allow sellers
                            to submit matching datasets for your review.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ py: { xs: 4, md: 5 } }}>
                <Card
                    elevation={0}
                    sx={{
                        bgcolor: "rgba(15, 23, 42, 0.88)",
                        color: "#FFFFFF",
                        border: "1px solid rgba(148, 163, 184, 0.18)",
                        borderRadius: 4,
                        boxShadow: "0 24px 70px rgba(0, 0, 0, 0.26)",
                    }}
                >
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                        <Box component="form" onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 950 }}>
                                        Request details
                                    </Typography>

                                    <Typography sx={{ color: "#94A3B8", mt: 0.8 }}>
                                        Sellers will see your specification, genre, and budget
                                        when browsing open requests.
                                    </Typography>
                                </Box>

                                {!isBusinessUser && (
                                    <Alert severity="warning">
                                        Only business users can create dataset requests.
                                    </Alert>
                                )}

                                {error && <Alert severity="error">{error}</Alert>}

                                {success && <Alert severity="success">{success}</Alert>}

                                <TextField
                                    select
                                    label="Genre"
                                    value={genre}
                                    onChange={(event) => setGenre(event.target.value as Genre)}
                                    fullWidth
                                    disabled={!isBusinessUser || loading}
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
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "rgba(103, 232, 249, 0.45)",
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
                                    label="Budget"
                                    type="number"
                                    value={budget}
                                    onChange={(event) => setBudget(event.target.value)}
                                    fullWidth
                                    disabled={!isBusinessUser || loading}
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
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "rgba(103, 232, 249, 0.45)",
                                        },
                                    }}
                                />

                                <TextField
                                    label="Specification"
                                    value={specification}
                                    onChange={(event) => setSpecification(event.target.value)}
                                    fullWidth
                                    multiline
                                    minRows={7}
                                    disabled={!isBusinessUser || loading}
                                    placeholder="Example: Need 500 anonymised customer support conversations with intent labels, issue category, and resolution status."
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
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "rgba(103, 232, 249, 0.45)",
                                        },
                                    }}
                                />

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1.5}
                                    sx={{ justifyContent: "flex-end" }}
                                >
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        onClick={() => navigate("/my-requests")}
                                        disabled={loading}
                                        sx={{
                                            borderRadius: 999,
                                            px: 3,
                                            py: 1.1,
                                            color: "#CBD5E1",
                                            borderColor: "rgba(148, 163, 184, 0.28)",
                                            fontWeight: 900,
                                            "&:hover": {
                                                borderColor: "rgba(103, 232, 249, 0.55)",
                                                bgcolor: "rgba(103, 232, 249, 0.08)",
                                            },
                                        }}
                                    >
                                        View My Requests
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={!isBusinessUser || loading}
                                        sx={{
                                            borderRadius: 999,
                                            px: 3,
                                            py: 1.1,
                                            bgcolor: "#2563EB",
                                            fontWeight: 950,
                                            boxShadow: "0 18px 40px rgba(37, 99, 235, 0.35)",
                                            "&:hover": {
                                                bgcolor: "#1D4ED8",
                                            },
                                        }}
                                    >
                                        {loading ? "Creating..." : "Create Request"}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}