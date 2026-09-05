import type { NextConfig } from 'next';

const onGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const basePath = onGitHubPages ? '/kassi-deutsch' : '';

const nextConfig: NextConfig = {
  output: 'export',
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;


