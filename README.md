## RaaS-Framework: Operational Resilience for Critical Infrastructures
# A geospatial heuristic-based service for disaster-altered environments using FIWARE, n8n, and A* pathfinding.


This framework implements a Service-Oriented Architecture (SOA) 
designed to enhance the operational resilience of electricity infrastructures during extreme weather events. 

<img width="684" height="677" alt="image" src="https://github.com/user-attachments/assets/75ebc57f-83d6-4256-91bf-0c5ca0399d90" />


By integrating real-time context management via FIWARE Orion and automated orchestration through n8n.
The system dynamically recalculates optimal multi-modal recovery paths. 
The core intelligence relies on a specialized $A^*$ heuristic solver that accounts for altitude variations, soil composition, and terrain slope to navigate untracked paths in mountainous environments."


<img width="918" height="297" alt="image" src="https://github.com/user-attachments/assets/c78da2bf-f904-4a3e-a772-565d1a709cc2" />






This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
