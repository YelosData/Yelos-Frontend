import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router";

const howItWorks = [
    {
        title: "Sellers list data",
        description:
            "Create marketplace posts with a genre, dataset description, content preview, and credit price.",
    },
    {
        title: "Businesses discover datasets",
        description:
            "Browse AI-ready conversational datasets by use case, compare listings, and inspect details before purchase.",
    },
    {
        title: "Credits power transactions",
        description:
            "Purchases are handled through credits, with transaction records and purchase history for accountability.",
    },
];

const genres = [
    "Education",
    "Customer Support",
    "Finance",
    "Coding Help",
    "Health & Wellness",
    "Travel",
];

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#020617",
                color: "#FFFFFF",
                overflow: "hidden",
            }}
        >
            {/* Hero background */}
            <Box
                sx={{
                    position: "relative",
                    borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
                    background:
                        "radial-gradient(circle at top left, rgba(6, 182, 212, 0.24), transparent 32%), radial-gradient(circle at top right, rgba(37, 99, 235, 0.24), transparent 30%), #020617",
                }}
            >
                {/* Subtle grid overlay */}
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
                        py: { xs: 8, md: 12 },
                    }}
                >
                    <Stack
                        spacing={4}
                        sx={{
                            maxWidth: 820,
                        }}
                    >
                        <Chip
                            label="AI-ready conversational data marketplace"
                            sx={{
                                width: "fit-content",
                                bgcolor: "rgba(6, 182, 212, 0.12)",
                                color: "#A5F3FC",
                                border: "1px solid rgba(6, 182, 212, 0.26)",
                                fontWeight: 800,
                                letterSpacing: 0.2,
                            }}
                        />

                        <Stack spacing={2}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: "2.7rem", md: "4.7rem" },
                                    lineHeight: 0.98,
                                    fontWeight: 950,
                                    letterSpacing: "-0.06em",
                                    color: "#FFFFFF",
                                    maxWidth: 900,
                                }}
                            >
                                Buy and sell high-value conversational datasets.
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{
                                    color: "#CBD5E1",
                                    lineHeight: 1.7,
                                    fontWeight: 500,
                                    maxWidth: 720,
                                }}
                            >
                                Yelos is a credit-based marketplace where sellers list
                                anonymised conversational data and businesses discover datasets
                                for analytics, research, and AI workflows.
                            </Typography>
                        </Stack>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate("/marketplace")}
                                sx={{
                                    px: 3,
                                    py: 1.35,
                                    borderRadius: 999,
                                    bgcolor: "#2563EB",
                                    fontWeight: 900,
                                    textTransform: "none",
                                    boxShadow: "0 16px 42px rgba(37, 99, 235, 0.38)",
                                    "&:hover": {
                                        bgcolor: "#1D4ED8",
                                        boxShadow: "0 18px 48px rgba(37, 99, 235, 0.48)",
                                    },
                                }}
                            >
                                Browse marketplace
                            </Button>

                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate("/register")}
                                sx={{
                                    px: 3,
                                    py: 1.35,
                                    borderRadius: 999,
                                    color: "#E0F2FE",
                                    borderColor: "rgba(125, 211, 252, 0.38)",
                                    fontWeight: 900,
                                    textTransform: "none",
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
                </Container>
            </Box>

            {/* Main content */}
            <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
                <Stack spacing={{ xs: 7, md: 9 }}>
                    {/* How it works */}
                    <Box>
                        <Stack spacing={1.2} sx={{ mb: 3.5 }}>
                            <Typography
                                variant="overline"
                                sx={{
                                    color: "#67E8F9",
                                    fontWeight: 900,
                                    letterSpacing: 1.4,
                                }}
                            >
                                HOW IT WORKS
                            </Typography>

                            <Typography
                                variant="h3"
                                sx={{
                                    color: "#FFFFFF",
                                    fontWeight: 950,
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                A simple exchange layer for data.
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#94A3B8",
                                    maxWidth: 680,
                                    lineHeight: 1.7,
                                }}
                            >
                                The platform connects data sellers and business buyers through
                                structured listings, credit-based purchases, and transaction
                                history.
                            </Typography>
                        </Stack>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                                gap: 2.5,
                            }}
                        >
                            {howItWorks.map((item, index) => (
                                <Card
                                    key={item.title}
                                    elevation={0}
                                    sx={{
                                        height: "100%",
                                        bgcolor: "rgba(15, 23, 42, 0.78)",
                                        color: "#FFFFFF",
                                        border: "1px solid rgba(148, 163, 184, 0.18)",
                                        borderRadius: 4,
                                        boxShadow: "0 24px 70px rgba(0, 0, 0, 0.22)",
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={2}>
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: 2.5,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    bgcolor: "rgba(37, 99, 235, 0.16)",
                                                    color: "#93C5FD",
                                                    fontWeight: 950,
                                                    border: "1px solid rgba(37, 99, 235, 0.26)",
                                                }}
                                            >
                                                {index + 1}
                                            </Box>

                                            <Typography
                                                variant="h6"
                                                sx={{ fontWeight: 900, color: "#FFFFFF" }}
                                            >
                                                {item.title}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "#94A3B8",
                                                    lineHeight: 1.75,
                                                }}
                                            >
                                                {item.description}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>

                    {/* Role cards */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                            gap: 2.5,
                        }}
                    >
                        <Card
                            elevation={0}
                            sx={{
                                bgcolor:
                                    "linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(15, 23, 42, 0.92))",
                                background:
                                    "linear-gradient(135deg, rgba(37, 99, 235, 0.20), rgba(15, 23, 42, 0.94))",
                                color: "#FFFFFF",
                                borderRadius: 4,
                                border: "1px solid rgba(96, 165, 250, 0.22)",
                            }}
                        >
                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                <Stack spacing={2}>
                                    <Chip
                                        label="For sellers"
                                        sx={{
                                            width: "fit-content",
                                            bgcolor: "rgba(37, 99, 235, 0.18)",
                                            color: "#BFDBFE",
                                            fontWeight: 900,
                                        }}
                                    />

                                    <Typography variant="h4" sx={{ fontWeight: 950 }}>
                                        Turn datasets into listings.
                                    </Typography>

                                    <Typography sx={{ color: "#CBD5E1", lineHeight: 1.75 }}>
                                        Create posts, assign genres, set credit prices, and track
                                        marketplace activity when buyers purchase your data.
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        onClick={() => navigate("/register")}
                                        sx={{
                                            width: "fit-content",
                                            mt: 1,
                                            borderRadius: 999,
                                            textTransform: "none",
                                            fontWeight: 900,
                                            bgcolor: "#2563EB",
                                            "&:hover": { bgcolor: "#1D4ED8" },
                                        }}
                                    >
                                        Start as seller
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card
                            elevation={0}
                            sx={{
                                background:
                                    "linear-gradient(135deg, rgba(6, 182, 212, 0.20), rgba(15, 23, 42, 0.94))",
                                color: "#FFFFFF",
                                borderRadius: 4,
                                border: "1px solid rgba(103, 232, 249, 0.22)",
                            }}
                        >
                            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                <Stack spacing={2}>
                                    <Chip
                                        label="For businesses"
                                        sx={{
                                            width: "fit-content",
                                            bgcolor: "rgba(6, 182, 212, 0.16)",
                                            color: "#A5F3FC",
                                            fontWeight: 900,
                                        }}
                                    />

                                    <Typography variant="h4" sx={{ fontWeight: 950 }}>
                                        Discover data for AI workflows.
                                    </Typography>

                                    <Typography sx={{ color: "#CBD5E1", lineHeight: 1.75 }}>
                                        Browse by genre, inspect dataset details, purchase with
                                        credits, and keep a history of acquired data products.
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        onClick={() => navigate("/marketplace")}
                                        sx={{
                                            width: "fit-content",
                                            mt: 1,
                                            borderRadius: 999,
                                            textTransform: "none",
                                            fontWeight: 900,
                                            bgcolor: "#0891B2",
                                            "&:hover": { bgcolor: "#0E7490" },
                                        }}
                                    >
                                        Explore marketplace
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Genre preview */}
                    <Box>
                        <Stack spacing={1.2} sx={{ mb: 3.5 }}>
                            <Typography
                                variant="overline"
                                sx={{
                                    color: "#67E8F9",
                                    fontWeight: 900,
                                    letterSpacing: 1.4,
                                }}
                            >
                                MARKETPLACE PREVIEW
                            </Typography>

                            <Typography
                                variant="h3"
                                sx={{
                                    color: "#FFFFFF",
                                    fontWeight: 950,
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                Browse data by use case.
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#94A3B8",
                                    maxWidth: 680,
                                    lineHeight: 1.7,
                                }}
                            >
                                Genres will later connect to backend pagination and filtering,
                                so buyers can browse large collections without loading every
                                post at once.
                            </Typography>
                        </Stack>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(2, 1fr)",
                                    md: "repeat(3, 1fr)",
                                },
                                gap: 2,
                            }}
                        >
                            {genres.map((genre) => (
                                <Card
                                    key={genre}
                                    elevation={0}
                                    onClick={() => navigate("/marketplace")}
                                    sx={{
                                        cursor: "pointer",
                                        bgcolor: "rgba(15, 23, 42, 0.78)",
                                        color: "#FFFFFF",
                                        borderRadius: 3.5,
                                        border: "1px solid rgba(148, 163, 184, 0.18)",
                                        transition: "transform 160ms ease, border-color 160ms ease, background 160ms ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            borderColor: "rgba(103, 232, 249, 0.42)",
                                            background: "rgba(15, 23, 42, 0.96)",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 2,
                                                    background:
                                                        "linear-gradient(135deg, #2563EB, #06B6D4)",
                                                    boxShadow: "0 0 24px rgba(6, 182, 212, 0.24)",
                                                }}
                                            />

                                            <Box>
                                                <Typography sx={{ fontWeight: 900 }}>
                                                    {genre}
                                                </Typography>

                                                <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                                                    View listings
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>

                    {/* Final CTA */}
                    <Box
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: 5,
                            textAlign: "center",
                            border: "1px solid rgba(103, 232, 249, 0.22)",
                            background:
                                "radial-gradient(circle at top, rgba(6, 182, 212, 0.20), transparent 34%), rgba(15, 23, 42, 0.88)",
                        }}
                    >
                        <Stack spacing={2.5} sx={{ alignItems: "center" }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 950,
                                    letterSpacing: "-0.04em",
                                    maxWidth: 760,
                                }}
                            >
                                Build the next data economy around conversations.
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#CBD5E1",
                                    maxWidth: 680,
                                    lineHeight: 1.75,
                                }}
                            >
                                Start with listings, browsing, and credit transactions. Later,
                                Yelos can grow into AI-assisted pricing, quality scoring, and
                                secure dataset recommendations.
                            </Typography>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate("/register")}
                                    sx={{
                                        px: 3,
                                        py: 1.25,
                                        borderRadius: 999,
                                        textTransform: "none",
                                        fontWeight: 900,
                                        bgcolor: "#2563EB",
                                        "&:hover": { bgcolor: "#1D4ED8" },
                                    }}
                                >
                                    Create account
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={() => navigate("/marketplace")}
                                    sx={{
                                        px: 3,
                                        py: 1.25,
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
                                    Browse marketplace
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}
