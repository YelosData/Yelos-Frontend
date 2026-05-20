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
      </Routes>
    </>
  )
}