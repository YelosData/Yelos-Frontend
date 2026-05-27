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
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    addCredits,
    withdrawCredits,
} from "../api/credit";
import { useAuth } from "../hooks/useAuth";

type TransactionMode = "ADD" | "WITHDRAW";

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
};


export default function CreditTransactionPage() {
    const navigate = useNavigate();
    const { user, updateCredits } = useAuth();
    const [mode, setMode] = useState<TransactionMode>("ADD");
    const [amount, setAmount] = useState("");
    const [displayCredits, setDisplayCredits] = useState(user?.credits ?? 0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    function handleAmountChange(value: string) {
        if (value === "" || Number(value) >= 0) {
            setAmount(value);
        }
    }

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!user) {
            setError("You must be logged in to manage credits.");
            return;
        }

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setError("Amount must be a positive number.");
            return;
        }

        if (mode === "WITHDRAW" && numericAmount > displayCredits) {
            setError("You cannot withdraw more credits than your current balance.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const response =
                mode === "ADD"
                    ? await addCredits({ userId: user.id, credits: numericAmount })
                    : await withdrawCredits({ userId: user.id, credits: numericAmount });

            updateCredits(response.credits);
            setDisplayCredits(response.credits);
            setAmount("");

            setMessage(
                mode === "ADD"
                    ? `Successfully added ${numericAmount} credits.`
                    : `Successfully withdrew ${numericAmount} credits.`
            );
        } catch (err) {
            console.error(err);
            setError(
                mode === "ADD"
                    ? "Failed to add credits. Check your backend logs."
                    : "Failed to withdraw credits. Check your backend logs or balance."
            );
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
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                    py: 6,
                }}
            >
                <Card
                    elevation={0}
                    sx={{
                        maxWidth: 540,
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
                                Sign in to manage credits.
                            </Typography>

                            <Typography sx={{ color: "#94A3B8", lineHeight: 1.7 }}>
                                Credit transactions are tied to your marketplace account. Login
                                before adding or withdrawing credits.
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={() => navigate("/login")}
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
                                Login
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
                            label="Credit wallet"
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
                                maxWidth: 850,
                            }}
                        >
                            Manage your marketplace credits.
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 740,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            Add credits to purchase datasets or withdraw available credits
                            from your account balance.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
                        gap: 3,
                        alignItems: "start",
                    }}
                >
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
                            <Stack spacing={3}>
                                <Box>
                                    <Typography sx={{ color: "#94A3B8", fontWeight: 800 }}>
                                        CURRENT BALANCE
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 0.5,
                                            fontSize: { xs: "2.8rem", md: "4rem" },
                                            lineHeight: 1,
                                            fontWeight: 950,
                                            letterSpacing: "-0.055em",
                                        }}
                                    >
                                        {displayCredits}
                                    </Typography>

                                    <Typography sx={{ color: "#CBD5E1", mt: 0.8 }}>
                                        credits available
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
                                        Account
                                    </Typography>

                                    <Typography sx={{ color: "#CBD5E1", mt: 0.5 }}>
                                        {user.username} · {user.role}
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
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 950 }}>
                                            Credit transaction
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#94A3B8", mt: 0.6 }}>
                                            Choose whether to add or withdraw credits, then enter the
                                            amount to process.
                                        </Typography>
                                    </Box>

                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={1.5}
                                        sx={{
                                            p: 0.75,
                                            borderRadius: 999,
                                            bgcolor: "rgba(2, 6, 23, 0.48)",
                                            border: "1px solid rgba(148, 163, 184, 0.16)",
                                        }}
                                    >
                                        <Button
                                            type="button"
                                            fullWidth
                                            onClick={() => {
                                                setMode("ADD");
                                                setError("");
                                                setMessage("");
                                            }}
                                            sx={{
                                                borderRadius: 999,
                                                textTransform: "none",
                                                fontWeight: 900,
                                                color: mode === "ADD" ? "#FFFFFF" : "#94A3B8",
                                                bgcolor: mode === "ADD" ? "#2563EB" : "transparent",
                                                "&:hover": {
                                                    bgcolor:
                                                        mode === "ADD"
                                                            ? "#1D4ED8"
                                                            : "rgba(255,255,255,0.06)",
                                                },
                                            }}
                                        >
                                            Add credits
                                        </Button>

                                        <Button
                                            type="button"
                                            fullWidth
                                            onClick={() => {
                                                setMode("WITHDRAW");
                                                setError("");
                                                setMessage("");
                                            }}
                                            sx={{
                                                borderRadius: 999,
                                                textTransform: "none",
                                                fontWeight: 900,
                                                color: mode === "WITHDRAW" ? "#FFFFFF" : "#94A3B8",
                                                bgcolor:
                                                    mode === "WITHDRAW" ? "#0891B2" : "transparent",
                                                "&:hover": {
                                                    bgcolor:
                                                        mode === "WITHDRAW"
                                                            ? "#0E7490"
                                                            : "rgba(255,255,255,0.06)",
                                                },
                                            }}
                                        >
                                            Withdraw credits
                                        </Button>
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

                                    {message && (
                                        <Alert
                                            severity="success"
                                            sx={{
                                                bgcolor: "rgba(22, 163, 74, 0.14)",
                                                color: "#BBF7D0",
                                                border: "1px solid rgba(74, 222, 128, 0.24)",
                                                borderRadius: 3,
                                                "& .MuiAlert-icon": {
                                                    color: "#86EFAC",
                                                },
                                            }}
                                        >
                                            {message}
                                        </Alert>
                                    )}

                                    <TextField
                                        label="Amount"
                                        type="number"
                                        value={amount}
                                        onChange={(event) => handleAmountChange(event.target.value)}
                                        fullWidth
                                        placeholder="e.g. 50"
                                        helperText={
                                            mode === "ADD"
                                                ? "Credits to add to your account."
                                                : "Credits to withdraw from your account."
                                        }
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

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{
                                            borderRadius: 999,
                                            textTransform: "none",
                                            fontWeight: 900,
                                            py: 1.25,
                                            bgcolor: mode === "ADD" ? "#2563EB" : "#0891B2",
                                            boxShadow:
                                                mode === "ADD"
                                                    ? "0 14px 34px rgba(37, 99, 235, 0.34)"
                                                    : "0 14px 34px rgba(8, 145, 178, 0.34)",
                                            "&:hover": {
                                                bgcolor: mode === "ADD" ? "#1D4ED8" : "#0E7490",
                                            },
                                        }}
                                    >
                                        {loading
                                            ? "Processing..."
                                            : mode === "ADD"
                                                ? "Add credits"
                                                : "Withdraw credits"}
                                    </Button>

                                    <Button
                                        type="button"
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
                                        Back to marketplace
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}


