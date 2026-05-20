import { useState } from "react";
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
import { createPost } from "../api/post";
import type { Genre } from "../types/post";

import type { Role, AuthUser } from "../types/auth"
import { useAuth } from "../hooks/useAuth";

const genreOptions: Array<{ label: string; value: Genre }> = [
    { label: "Education", value: "EDUCATION" },
    { label: "Customer Support", value: "CUSTOMER_SUPPORT" },
    { label: "Finance", value: "FINANCE" },
    { label: "Coding", value: "CODING" },
    { label: "Health & Wellness", value: "HEALTH_WELLNESS" },
    { label: "Travel", value: "TRAVEL" },
    { label: "Other", value: "OTHER" },
];

function getStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as AuthUser;
    } catch (err) {
        console.error("Failed to parse stored user", err);
        localStorage.removeItem("user");
        return null;
    }
}

export default function CreatePostPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [genre, setGenre] = useState<Genre>("EDUCATION");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!user) {
            setError("You must be logged in to create a post.");
            return;
        }

        if (user.role !== "SELLER") {
            setError("Only seller accounts can create marketplace posts.");
            return;
        }

        const cleanedTitle = title.trim();
        const cleanedSummary = summary.trim();
        const cleanedContent = content.trim();
        const numericPrice = Number(price);

        if (!cleanedTitle || !cleanedSummary || !cleanedContent) {
            setError("Please fill in all required fields.");
            return;
        }

        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            setError("Price must be a positive number.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await createPost({
                userId: user.id,
                genre,
                title: cleanedTitle,
                summary: cleanedSummary,
                content: cleanedContent,
                price: numericPrice,
            });

            navigate("/marketplace");
        } catch (err) {
            console.error(err);
            setError("Failed to create post. Check your backend logs or request body.");
        } finally {
            setLoading(false);
        }
    }

    if (!user) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    bgcolor: "#020617",
                    color: "#FFFFFF",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    px: 2,
                    py: 6,
                }}
            >
                <Card
                    elevation={0}
                    sx={{
                        maxWidth: 520,
                        width: "100%",
                        bgcolor: "rgba(15, 23, 42, 0.88)",
                        color: "#FFFFFF",
                        border: "1px solid rgba(148, 163, 184, 0.18)",
                        borderRadius: 4,
                        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.32)",
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Stack spacing={2.5}>
                            <Chip
                                label="Authentication required"
                                sx={{
                                    width: "fit-content",
                                    bgcolor: "rgba(37, 99, 235, 0.14)",
                                    color: "#BFDBFE",
                                    border: "1px solid rgba(37, 99, 235, 0.24)",
                                    fontWeight: 900,
                                }}
                            />

                            <Typography variant="h4" sx={{ fontWeight: 950 }}>
                                Sign in to create a listing.
                            </Typography>

                            <Typography sx={{ color: "#94A3B8", lineHeight: 1.7 }}>
                                Only seller accounts can create marketplace posts. Sign in with
                                a seller account or create one to start listing data.
                            </Typography>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                <Button
                                    variant="contained"
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
                                    Login
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={() => navigate("/register")}
                                    sx={{
                                        borderRadius: 999,
                                        textTransform: "none",
                                        fontWeight: 900,
                                        color: "#E0F2FE",
                                        borderColor: "rgba(125, 211, 252, 0.38)",
                                        "&:hover": {
                                            borderColor: "#67E8F9",
                                            bgcolor: "rgba(6, 182, 212, 0.08)",
                                        },
                                    }}
                                >
                                    Create account
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    if (user.role !== "SELLER") {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    bgcolor: "#020617",
                    color: "#FFFFFF",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
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
                        border: "1px solid rgba(148, 163, 184, 0.18)",
                        borderRadius: 4,
                        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.32)",
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        <Stack spacing={2.5}>
                            <Chip
                                label="Seller access only"
                                sx={{
                                    width: "fit-content",
                                    bgcolor: "rgba(220, 38, 38, 0.14)",
                                    color: "#FECACA",
                                    border: "1px solid rgba(248, 113, 113, 0.24)",
                                    fontWeight: 900,
                                }}
                            />

                            <Typography variant="h4" sx={{ fontWeight: 950 }}>
                                This page is for sellers.
                            </Typography>

                            <Typography sx={{ color: "#94A3B8", lineHeight: 1.7 }}>
                                Business accounts can browse and purchase datasets, but they
                                cannot create marketplace listings.
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
                                Browse marketplace
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
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
                        py: { xs: 5, md: 7 },
                    }}
                >
                    <Stack spacing={2}>
                        <Chip
                            label="Seller workspace"
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
                                fontSize: { xs: "2.2rem", md: "3.7rem" },
                                maxWidth: 820,
                            }}
                        >
                            Create a marketplace data listing.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 720,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            Add a title, genre, summary, full dataset content, and credit
                            price. Buyers will see the summary first and inspect details
                            before purchasing.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "0.8fr 1.2fr" },
                        gap: 3,
                    }}
                >
                    <Card
                        elevation={0}
                        sx={{
                            height: "fit-content",
                            bgcolor: "rgba(15, 23, 42, 0.82)",
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
                                        Listing checklist
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.6 }}>
                                        Strong listings are clear, specific, and easy for buyers to
                                        evaluate.
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
                                    <Typography sx={{ color: "#BFDBFE", fontWeight: 900 }}>
                                        1. Use a searchable title
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.5 }}>
                                        Mention the domain, use case, or audience clearly.
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
                                    <Typography sx={{ color: "#A5F3FC", fontWeight: 900 }}>
                                        2. Summarise buyer value
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.5 }}>
                                        Explain what the dataset contains and what it can be used for.
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        bgcolor: "rgba(15, 23, 42, 0.95)",
                                        border: "1px solid rgba(148, 163, 184, 0.18)",
                                    }}
                                >
                                    <Typography sx={{ color: "#E0F2FE", fontWeight: 900 }}>
                                        3. Keep content anonymised
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.5 }}>
                                        Remove names, emails, phone numbers, addresses, and other
                                        direct identifiers before listing.
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
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2.5}>
                                    <Stack spacing={0.6}>
                                        <Typography variant="h5" sx={{ fontWeight: 950 }}>
                                            Listing details
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                                            Logged in as {user.username}. This post will be attached
                                            to your seller account.
                                        </Typography>
                                    </Stack>

                                    {error && (
                                        <Alert
                                            severity="error"
                                            sx={{
                                                bgcolor: "rgba(127, 29, 29, 0.22)",
                                                color: "#FECACA",
                                                border: "1px solid rgba(248, 113, 113, 0.28)",
                                                borderRadius: 3,
                                                "& .MuiAlert-icon": {
                                                    color: "#FCA5A5",
                                                },
                                            }}
                                        >
                                            {error}
                                        </Alert>
                                    )}

                                    <TextField
                                        label="Title"
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        fullWidth
                                        placeholder="e.g. Student Exam Prep Conversations"
                                        sx={textFieldSx}
                                    />

                                    <TextField
                                        select
                                        label="Genre"
                                        value={genre}
                                        onChange={(event) => setGenre(event.target.value as Genre)}
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
                                        label="Summary"
                                        value={summary}
                                        onChange={(event) => setSummary(event.target.value)}
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        placeholder="Briefly describe what buyers will get from this dataset."
                                        helperText={`${summary.length}/1000 recommended max`}
                                        sx={textFieldSx}
                                    />

                                    <TextField
                                        label="Full content"
                                        value={content}
                                        onChange={(event) => setContent(event.target.value)}
                                        fullWidth
                                        multiline
                                        minRows={8}
                                        placeholder="Paste or describe the full anonymised dataset content here."
                                        sx={textFieldSx}
                                    />

                                    <TextField
                                        label="Price"
                                        type="number"
                                        value={price}
                                        onChange={(event) => {
                                            const value = event.target.value;

                                            if (value === "" || Number(value) >= 0) {
                                                setPrice(value);
                                            }
                                        }}
                                        fullWidth
                                        placeholder="e.g. 20"
                                        helperText="Credits required for a buyer to purchase this post."
                                        sx={{
                                            ...textFieldSx,
                                            "& input[type=number]::-webkit-outer-spin-button": {
                                                WebkitAppearance: "none",
                                                margin: 0,
                                            },
                                            "& input[type=number]::-webkit-inner-spin-button": {
                                                WebkitAppearance: "none",
                                                margin: 0,
                                            },
                                            "& input[type=number]": {
                                                MozAppearance: "textfield",
                                            },
                                        }}
                                        slotProps={{
                                            htmlInput: {
                                                min: 0,
                                            },
                                        }}
                                    />

                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={1.5}
                                        sx={{
                                            justifyContent: "space-between",
                                            pt: 1,
                                        }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate("/marketplace")}
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
                                            Cancel
                                        </Button>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading}
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
                                            {loading ? "Creating post..." : "Create listing"}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}

const textFieldSx = {
    "& .MuiInputLabel-root": {
        color: "#94A3B8",
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: "#67E8F9",
    },
    "& .MuiOutlinedInput-root": {
        color: "#FFFFFF",
        borderRadius: 2.5,
        bgcolor: "rgba(2, 6, 23, 0.35)",
        "& fieldset": {
            borderColor: "rgba(148, 163, 184, 0.28)",
        },
        "&:hover fieldset": {
            borderColor: "rgba(103, 232, 249, 0.52)",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#67E8F9",
        },
    },
    "& .MuiFormHelperText-root": {
        color: "#64748B",
    },
    "& .MuiSvgIcon-root": {
        color: "#CBD5E1",
    },
};
