import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
        {
            protocol: "https",
            hostname: "s3-",
            port: "",
            pathname: "/**"
        }
    ]
}
};

export default nextConfig;
