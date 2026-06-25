import { Route, Routes } from "react-router";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import CreatePostPage from "./pages/CreatePostPage";
import PostDetailsPage from "./pages/PostDetailsPage";
import CreditTransactionPage from "./pages/CreditTransactionPage";
import MyPostsPage from "./pages/MyPostPage";
import MyPurchasesPage from "./pages/MyPurchasesPage";
import CreateRequestPage from "./pages/CreateRequestPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import RequestMarketplacePage from "./pages/RequestMarketplacePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";


export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/posts/:postId" element={<PostDetailsPage />} />
        <Route path="/credittransaction" element={<CreditTransactionPage />} />
        <Route path="/my-posts" element={<MyPostsPage />} />
        <Route path="/my-purchases" element={<MyPurchasesPage />} />
        <Route path="/create-request" element={<CreateRequestPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} />
        <Route path="/requests/:requestId" element={<RequestDetailPage />} />
        <Route path="/request-marketplace" element={<RequestMarketplacePage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </>
  )
}