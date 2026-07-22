import { useEffect, useState, type ChangeEvent } from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Pagination,
    Stack,
    Typography,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { getTransactionsByUser } from "../api/transaction";
import type {
    TransactionResponse,
    TransactionType,
} from "../types/transaction";

const PAGE_SIZE = 10;

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString("en-SG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatCredits(value: number): string {
    return `${Number(value).toLocaleString("en-SG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })} credits`;
}

function getTransactionMeta(type: TransactionType) {
    switch (type) {
        case "PURCHASE_DEBIT":
            return {
                label: "Purchase",
                description: "Credits spent on a dataset purchase",
                sign: "-",
                color: "#FCA5A5",
                chipBg: "rgba(239, 68, 68, 0.14)",
                chipBorder: "rgba(248, 113, 113, 0.28)",
            };

        case "SALE_CREDIT":
            return {
                label: "Sale",
                description: "Credits earned from a dataset sale",
                sign: "+",
                color: "#86EFAC",
                chipBg: "rgba(22, 163, 74, 0.14)",
                chipBorder: "rgba(74, 222, 128, 0.28)",
            };

        case "ADD_CREDIT":
            return {
                label: "Top Up",
                description: "Credits added to your account",
                sign: "+",
                color: "#93C5FD",
                chipBg: "rgba(37, 99, 235, 0.14)",
                chipBorder: "rgba(96, 165, 250, 0.28)",
            };

        default:
            return {
                label: "Transaction",
                description: "Credit transaction",
                sign: "",
                color: "#CBD5E1",
                chipBg: "rgba(148, 163, 184, 0.14)",
                chipBorder: "rgba(148, 163, 184, 0.28)",
            };
    }
}

export default function TransactionHistoryPage() {
    const { user } = useAuth();

    const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchTransactions() {
            if (!user) {
                setTransactions([]);
                setTotalPages(1);
                setTotalElements(0);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const result = await getTransactionsByUser(
                    user.id,
                    page - 1,
                    PAGE_SIZE,
                );

                setTransactions(result.content);
                setTotalPages(result.totalPages === 0 ? 1 : result.totalPages);
                setTotalElements(result.totalElements);
            } catch (err) {
                console.error(err);
                setError("Failed to load transaction history.");
            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();
    }, [user, page]);

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
                    borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
                    background:
                        "radial-gradient(circle at top left, rgba(59, 130, 246, 0.22), transparent 30%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.18), transparent 30%), #020617",
                }}
            >
                <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
                    <Stack spacing={2}>
                        <Chip
                            label="Credits"
                            sx={{
                                width: "fit-content",
                                bgcolor: "rgba(37, 99, 235, 0.14)",
                                color: "#BFDBFE",
                                border: "1px solid rgba(96, 165, 250, 0.26)",
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
                                fontSize: { xs: "2.2rem", md: "3.8rem" },
                            }}
                        >
                            Transaction history
                        </Typography>

                        <Typography
                            sx={{
                                color: "#CBD5E1",
                                maxWidth: 720,
                                lineHeight: 1.75,
                                fontSize: { xs: "1rem", md: "1.08rem" },
                            }}
                        >
                            Track credit top-ups, dataset purchases, and sale earnings from
                            your Yelos account.
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
                {!user && (
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
                            <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                Please log in
                            </Typography>

                            <Typography sx={{ color: "#94A3B8", mt: 1 }}>
                                You need to be logged in to view your transaction history.
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {user && (
                    <Stack spacing={3}>
                        <Card
                            elevation={0}
                            sx={{
                                bgcolor: "rgba(15, 23, 42, 0.82)",
                                color: "#FFFFFF",
                                border: "1px solid rgba(148, 163, 184, 0.18)",
                                borderRadius: 4,
                                boxShadow: "0 24px 70px rgba(0, 0, 0, 0.20)",
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={2}
                                    sx={{
                                        justifyContent: "space-between",
                                        alignItems: {
                                            xs: "flex-start",
                                            sm: "center",
                                        },
                                    }}
                                >
                                    <Box>
                                        <Typography sx={{ color: "#94A3B8", fontWeight: 800 }}>
                                            Current balance
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            sx={{
                                                color: "#FFFFFF",
                                                fontWeight: 950,
                                                mt: 0.5,
                                            }}
                                        >
                                            {formatCredits(Number(user.credits ?? 0))}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography sx={{ color: "#94A3B8", fontWeight: 800 }}>
                                            Total records
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            sx={{
                                                color: "#93C5FD",
                                                fontWeight: 950,
                                                mt: 0.5,
                                            }}
                                        >
                                            {totalElements}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

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

                        {!loading && !error && transactions.length === 0 && (
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
                                    <Typography variant="h6" sx={{ fontWeight: 950 }}>
                                        No transactions yet
                                    </Typography>

                                    <Typography sx={{ color: "#94A3B8", mt: 1 }}>
                                        Your purchases, sales, and credit top-ups will appear here.
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}

                        {!loading && !error && transactions.length > 0 && (
                            <Stack spacing={2}>
                                {transactions.map((transaction) => {
                                    const meta = getTransactionMeta(transaction.type);

                                    return (
                                        <Card
                                            key={transaction.id}
                                            elevation={0}
                                            sx={{
                                                bgcolor: "rgba(15, 23, 42, 0.82)",
                                                color: "#FFFFFF",
                                                border: "1px solid rgba(148, 163, 184, 0.18)",
                                                borderRadius: 4,
                                                transition:
                                                    "transform 160ms ease, border-color 160ms ease, background 160ms ease",
                                                "&:hover": {
                                                    transform: "translateY(-2px)",
                                                    borderColor: "rgba(103, 232, 249, 0.36)",
                                                    background: "rgba(15, 23, 42, 0.96)",
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Stack
                                                    direction={{ xs: "column", sm: "row" }}
                                                    spacing={2}
                                                    sx={{
                                                        justifyContent: "space-between",
                                                        alignItems: {
                                                            xs: "flex-start",
                                                            sm: "center",
                                                        },
                                                    }}
                                                >
                                                    <Stack spacing={1}>
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            sx={{
                                                                flexWrap: "wrap",
                                                                rowGap: 1,
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <Chip
                                                                label={meta.label}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: meta.chipBg,
                                                                    color: meta.color,
                                                                    border: `1px solid ${meta.chipBorder}`,
                                                                    fontWeight: 900,
                                                                }}
                                                            />

                                                            {transaction.purchaseId !== null && (
                                                                <Chip
                                                                    label={`Purchase #${transaction.purchaseId}`}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: "rgba(148, 163, 184, 0.1)",
                                                                        color: "#CBD5E1",
                                                                        border: "1px solid rgba(148, 163, 184, 0.2)",
                                                                        fontWeight: 800,
                                                                    }}
                                                                />
                                                            )}
                                                        </Stack>

                                                        <Box>
                                                            <Typography sx={{ fontWeight: 950 }}>
                                                                {meta.description}
                                                            </Typography>

                                                            <Typography
                                                                variant="body2"
                                                                sx={{ color: "#94A3B8", mt: 0.4 }}
                                                            >
                                                                {formatDate(transaction.createdAt)}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>

                                                    <Stack
                                                        spacing={0.5}
                                                        sx={{
                                                            alignItems: {
                                                                xs: "flex-start",
                                                                sm: "flex-end",
                                                            },
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                color: meta.color,
                                                                fontWeight: 950,
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {meta.sign}
                                                            {formatCredits(Number(transaction.amount))}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: "#94A3B8", whiteSpace: "nowrap" }}
                                                        >
                                                            Balance after:{" "}
                                                            <Box
                                                                component="span"
                                                                sx={{ color: "#CBD5E1", fontWeight: 900 }}
                                                            >
                                                                {formatCredits(Number(transaction.balanceAfter))}
                                                            </Box>
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
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
                )}
            </Container>
        </Box>
    );
}