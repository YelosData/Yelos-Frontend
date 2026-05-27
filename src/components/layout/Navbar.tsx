import { useState } from "react";
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";


export default function Navbar() {
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const displayName = user?.username ?? "User";

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    function handleMenuOpen(event: React.MouseEvent<HTMLElement>) {
        setAnchorEl(event.currentTarget);
    }

    function handleMenuClose() {
        setAnchorEl(null);
    }

    function handleLogout() {
        logout();
        handleMenuClose();
        navigate("/");
    }

    function navButton(label: string, path: string) {
        return (
            <Button
                onClick={() => navigate(path)}
                sx={{
                    color: "#CBD5E1",
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": {
                        color: "#FFFFFF",
                        bgcolor: "rgba(255,255,255,0.06)",
                    },
                }}
            >
                {label}
            </Button>
        );
    }

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                bgcolor: "rgba(2, 6, 23, 0.92)",
                borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
                backdropFilter: "blur(14px)",
            }}
        >
            <Toolbar
                sx={{
                    minHeight: 72,
                    px: { xs: 2, md: 5 },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                {/* Left logo */}
                <Box
                    onClick={() => navigate("/")}
                    sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                    }}
                >
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #2563EB, #06B6D4)",
                            boxShadow: "0 0 24px rgba(6, 182, 212, 0.35)",
                        }}
                    />

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 900,
                            letterSpacing: -0.4,
                            color: "#FFFFFF",
                        }}
                    >
                        Yelos
                    </Typography>
                </Box>

                {/* Middle nav links */}
                <Box
                    sx={{
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    {navButton("Home", "/")}
                    {navButton("Marketplace", "/marketplace")}

                    {user?.role === "SELLER" && (
                        <>
                            {navButton("Create Post", "/create-post")}
                            {navButton("My Posts", "/my-posts")}
                        </>
                    )}

                    {user?.role === "BUSINESS" && (
                        <>
                            {navButton("My Purchases", "/my-purchases")}
                        </>
                    )}
                </Box>

                {/* Right side */}
                {!user ? (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                        }}
                    >
                        <Button
                            onClick={() => navigate("/login")}
                            sx={{
                                color: "#CBD5E1",
                                textTransform: "none",
                                fontWeight: 800,
                                "&:hover": {
                                    color: "#FFFFFF",
                                    bgcolor: "rgba(255,255,255,0.06)",
                                },
                            }}
                        >
                            Login
                        </Button>

                        <Button
                            variant="contained"
                            onClick={() => navigate("/register")}
                            sx={{
                                textTransform: "none",
                                fontWeight: 900,
                                borderRadius: 999,
                                px: 2.4,
                                bgcolor: "#2563EB",
                                boxShadow: "0 10px 28px rgba(37, 99, 235, 0.34)",
                                "&:hover": {
                                    bgcolor: "#1D4ED8",
                                },
                            }}
                        >
                            Get Started
                        </Button>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        <Chip
                            label={`${user.credits} credits`}
                            size="small"
                            sx={{
                                display: { xs: "none", sm: "flex" },
                                bgcolor: "rgba(6, 182, 212, 0.12)",
                                color: "#A5F3FC",
                                border: "1px solid rgba(6, 182, 212, 0.28)",
                                fontWeight: 800,
                            }}
                        />

                        <Button
                            onClick={handleMenuOpen}
                            sx={{
                                color: "#FFFFFF",
                                textTransform: "none",
                                fontWeight: 800,
                                borderRadius: 999,
                                px: 1,
                                "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.06)",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: "#2563EB",
                                        fontSize: "0.9rem",
                                        fontWeight: 900,
                                    }}
                                >
                                    {displayName.charAt(0).toUpperCase()}
                                </Avatar>

                                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                                    {displayName}
                                </Box>
                            </Box>
                        </Button>

                        {user && (
                            <Menu
                                anchorEl={anchorEl}
                                open={menuOpen}
                                onClose={handleMenuClose}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            mt: 1.2,
                                            width: 260,
                                            borderRadius: 3,
                                            overflow: "hidden",
                                            border: "1px solid rgba(148, 163, 184, 0.24)",
                                            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.22)",
                                        },
                                    },
                                }}
                            >
                                {/* User header */}
                                <Box
                                    sx={{
                                        px: 2,
                                        py: 2,
                                        background:
                                            "linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(6, 182, 212, 0.12))",
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                        sx={{ alignItems: "center" }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                bgcolor: "#2563EB",
                                                fontWeight: 900,
                                                fontSize: "1rem",
                                            }}
                                        >
                                            {user.username.charAt(0).toUpperCase()}
                                        </Avatar>

                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontWeight: 900,
                                                    color: "#0F172A",
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {user.username}
                                            </Typography>

                                            <Chip
                                                label={user.role}
                                                size="small"
                                                sx={{
                                                    mt: 0.7,
                                                    height: 22,
                                                    bgcolor:
                                                        user.role === "SELLER"
                                                            ? "rgba(37, 99, 235, 0.12)"
                                                            : "rgba(6, 182, 212, 0.14)",
                                                    color: user.role === "SELLER" ? "#1D4ED8" : "#0891B2",
                                                    fontWeight: 800,
                                                    fontSize: "0.7rem",
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                </Box>

                                {/* Credit balance */}
                                <Box sx={{ px: 2, py: 1.5 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "#64748B",
                                            fontWeight: 800,
                                            letterSpacing: 0.6,
                                        }}
                                    >
                                        CREDIT BALANCE
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: "#0F172A",
                                            fontWeight: 900,
                                            mt: 0.2,
                                        }}
                                    >
                                        {user.credits} credits
                                    </Typography>
                                </Box>

                                <Divider />

                                <MenuItem
                                    onClick={() => {
                                        handleMenuClose();
                                        navigate("/history");
                                    }}
                                    sx={{
                                        py: 1.3,
                                        fontWeight: 700,
                                        color: "#334155",
                                    }}
                                >
                                    Transaction history
                                </MenuItem>

                                <MenuItem
                                    onClick={() => {
                                        handleMenuClose();
                                        navigate("/profile");
                                    }}
                                    sx={{
                                        py: 1.3,
                                        fontWeight: 700,
                                        color: "#334155",
                                    }}
                                >
                                    Profile settings
                                </MenuItem>

                                <MenuItem
                                    onClick={() => {
                                        handleMenuClose();
                                        navigate("/credittransaction");
                                    }}
                                    sx={{
                                        py: 1.3,
                                        fontWeight: 700,
                                        color: "#334155",
                                    }}
                                >
                                    Add credits
                                </MenuItem>

                                <Divider />

                                <MenuItem
                                    onClick={handleLogout}
                                    sx={{
                                        py: 1.3,
                                        fontWeight: 900,
                                        color: "#DC2626",
                                        "&:hover": {
                                            bgcolor: "rgba(220, 38, 38, 0.08)",
                                        },
                                    }}
                                >
                                    Logout
                                </MenuItem>
                            </Menu>
                        )}
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}
