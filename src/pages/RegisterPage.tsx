import { useState } from "react";
import type { Role } from "../types/auth";
import { Register } from "../api/auth";
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";


export default function RegisterPage() {
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [role, setRole] = useState<Role>("SELLER");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");  // For error handling, implementation in the future
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            const res = await Register({
                username,
                email,
                password,
                role,
            });

            login(res);

            navigate("/marketplace");
        } catch (e) {
            console.log(e);
            // error handling logic
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
                    maxWidth: 980,
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
                            Trade conversational data for AI-ready insight.
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                mt: 2,
                                color: "rgba(255,255,255,0.76)",
                                lineHeight: 1.7,
                            }}
                        >
                            A marketplace for sellers to list anonymised datasets and for
                            businesses to purchase high-value conversational data with credits.
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
                                Data quality scoring
                            </Typography>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.70)" }}>
                                Future AI-assisted ranking and pricing support.
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
                                Credit-based exchange
                            </Typography>
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.70)" }}>
                                Buyers purchase datasets through marketplace credits.
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
                                    Create account
                                </Typography>

                                <Typography variant="body2" sx={{ color: "#64748B" }}>
                                    Join Yelos as a seller or business buyer.
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
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                fullWidth
                                autoComplete="email"
                            />

                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                fullWidth
                                autoComplete="new-password"
                            />

                            <TextField
                                select
                                label="Account type"
                                value={role}
                                onChange={(event) => setRole(event.target.value as Role)}
                                fullWidth
                            >
                                <MenuItem value="SELLER">Seller</MenuItem>
                                <MenuItem value="BUSINESS">Business</MenuItem>
                            </TextField>

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
                                {loading ? "Creating account..." : "Create account"}
                            </Button>

                            <Typography
                                variant="body2"
                                sx={{
                                    textAlign: "center",
                                    color: "#64748B",
                                }}
                            >
                                Already have an account?{" "}
                                <Box
                                    component="span"
                                    onClick={() => navigate("/login")}
                                    sx={{
                                        color: "#2563EB",
                                        fontWeight: 900,
                                        cursor: "pointer",
                                        "&:hover": {
                                            textDecoration: "underline",
                                        },
                                    }}
                                >
                                    Sign in
                                </Box>
                            </Typography>
                        </Stack>
                    </form>
                </Box>
            </Paper>
        </Box>
    );
}