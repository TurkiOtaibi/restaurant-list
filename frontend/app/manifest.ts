import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "سجل",
    short_name: "سجل",
    description: "سجل شخصي للأماكن",
    id: "/",
    scope: "/",
    start_url: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    launch_handler: {
      client_mode: "focus-existing"
    },
    prefer_related_applications: false,
    categories: ["food", "lifestyle", "social"],
    background_color: "#090e16",
    theme_color: "#090e16",
    lang: "ar",
    dir: "rtl",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    screenshots: [
      {
        src: "/screenshots/sijil-mobile-home.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "واجهة سجل على الجوال"
      },
      {
        src: "/screenshots/sijil-desktop-home.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "واجهة سجل على سطح المكتب"
      }
    ],
    shortcuts: [
      {
        name: "الأماكن",
        short_name: "الأماكن",
        description: "افتح كتالوج الأماكن في سجل.",
        url: "/places?type=restaurant",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "قوائمي",
        short_name: "قوائمي",
        description: "افتح قوائم الأماكن الخاصة بك.",
        url: "/lists",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "صفحتي",
        short_name: "صفحتي",
        description: "افتح صفحة ملفك وتقييماتك.",
        url: "/profile",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      }
    ]
  };
}
