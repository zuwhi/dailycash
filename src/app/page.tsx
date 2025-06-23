"use client";

// import { useEffect } from "react";
// import { isAuthenticated } from "@/lib/auth";
import DaisyCashLanding from "./DaisycashLandingPage";

export default function HomePage() {
  // useEffect(() => {
  //   const checkAuthAndRedirect = async () => {
  //     try {
  //       const authenticated = await isAuthenticated();
  //       if (authenticated) {
  //         window.location.replace("/dashboard");
  //       } else {
  //         window.location.replace("/auth/login");
  //       }
  //     } catch (error) {
  //       window.location.replace("/auth/login");
  //     }
  //   };

  //   checkAuthAndRedirect();
  // }, []);

  return (
    <DaisyCashLanding/>
  );
}
