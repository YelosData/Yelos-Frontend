import { useState } from "react";
import { Login } from "../api/auth";
import { useNavigate } from "react-router";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>(""); //implement error handling
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        try {
            setLoading(true);
            const res = await Login({
                username,
                password
            });

            login(res);

            navigate("/");
        } catch (e) {
            console.log(e);  // implement error handling
            setError("");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                py: 6,
                background:
                    "radial-gradient(circle at top left, rgba(6, 182, 212, 0.28), transparent 32%), radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.30), transparent 35%), #020617",
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 940,
                    overflow: "hidden",
                    borderRadius: 5,
                    border: "1px solid rgba(148, 163, 184, 0.22)",
                    boxShadow: "0 30px 100px rgba(0, 0, 0, 0.45)",
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
                }}
            >
                {/* Left tech/data panel */}
                <Box
                    sx={{
                        display: { xs: "none", md: "flex" },
                        flexDirection: "column",
                        justifyContent: "space-between",
                        p: 5,
                        color: "white",
                        background:
                            "linear-gradient(135deg, #0F172A 0%, #1E3A8A 48%, #0891B2 100%)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0.18,
                            backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
                            backgroundSize: "36px 36px",
                        }}
                    />

                    <Box sx={{ position: "relative", zIndex: 1 }}>
                        <Typography
                            variant="overline"
                            sx={{
                                fontWeight: 900,
                                letterSpacing: 1.6,
                                color: "#A5F3FC",
                            }}
                        >
                            YELOS DATA MARKETPLACE
                        </Typography>

                        <Typography
                            variant="h4"
                            sx={{
                                mt: 2,
                                fontWeight: 900,
                                lineHeight: 1.15,
                            }}
                        >
                            Welcome back to your data exchange hub.
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                mt: 2,
                                color: "rgba(255,255,255,0.76)",
                                lineHeight: 1.7,
                            }}
                        >
                            Access your listings, marketplace purchases, transaction history,
                            and credit balance from one dashboard.
                        </Typography>
                    </Box>

                    <Stack spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: "rgba(255,255,255,0.10)",
                                border: "1px solid rgba(255,255,255,0.16)",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <Typography variant="body2" sx={{ color: "#A5F3FC", fontWeight: 800 }}>
                                Marketplace dashboard
                            </Typography>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.70)" }}>
                                Manage buying, selling, and transaction activity.
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: "rgba(255,255,255,0.10)",
                                border: "1px solid rgba(255,255,255,0.16)",
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <Typography variant="body2" sx={{ color: "#A5F3FC", fontWeight: 800 }}>
                                AI-ready data economy
                            </Typography>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.70)" }}>
                                Discover conversational datasets for future ML workflows.
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* Right form panel */}
                <Box
                    sx={{
                        p: { xs: 3, sm: 5 },
                        bgcolor: "#F8FAFC",
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2.4}>
                            <Stack spacing={0.75}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 900,
                                        color: "#0F172A",
                                    }}
                                >
                                    Sign in
                                </Typography>

                                <Typography variant="body2" sx={{ color: "#64748B" }}>
                                    Continue to your Yelos marketplace account.
                                </Typography>
                            </Stack>

                            <TextField
                                label="Username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                fullWidth
                                autoComplete="username"
                            />

                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                fullWidth
                                autoComplete="current-password"
                            />

                            {error && (
                                <Typography variant="body2" color="error">
                                    {error}
                                </Typography>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    mt: 0.5,
                                    py: 1.35,
                                    fontWeight: 900,
                                    textTransform: "none",
                                    borderRadius: 2.5,
                                    bgcolor: "#2563EB",
                                    boxShadow: "0 12px 28px rgba(37, 99, 235, 0.32)",
                                    "&:hover": {
                                        bgcolor: "#1D4ED8",
                                        boxShadow: "0 14px 34px rgba(37, 99, 235, 0.42)",
                                    },
                                }}
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </Button>

                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "center",
                                    color: "#64748B",
                                }}
                            >
                                New to Yelos?{" "}
                                <Box
                                    component="span"
                                    onClick={() => navigate("/register")}
                                    sx={{
                                        color: "#2563EB",
                                        fontWeight: 900,
                                        cursor: "pointer",
                                        "&:hover": {
                                            textDecoration: "underline",
                                        },
                                    }}
                                >
                                    Create account
                                </Box>
                            </Typography>
                        </Stack>
                    </form>
                </Box>
            </Paper>
        </Box>
    );
}