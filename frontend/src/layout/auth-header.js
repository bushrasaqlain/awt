// layout/auth-header.js
import Link from "next/link";
import { useRouter } from "next/router";

export default function AuthHeader() {
  const router = useRouter();
  const isLogin = router.pathname === "/login";

  return (
    <header className="auth-header">
      <div className="container">
        <div className="auth-header-inner">
          {/* Logo */}
          <div className="auth-logo">
            <Link href="/">
              <img src="/images/logo.svg" alt="Logo" />
            </Link>
          </div>

          {/* Auth Navigation */}
          <div className="auth-nav">
            {isLogin ? (
              <>
                <span className="auth-text">Don't have an account?</span>
                <Link href="/register" className="auth-btn">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <span className="auth-text">Already have an account?</span>
                <Link href="/login" className="auth-btn">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}