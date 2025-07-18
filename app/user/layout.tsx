import React from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-6xl p-8 bg-card rounded-lg shadow-md">
        {children}
      </div>
    </div>
  );
}
