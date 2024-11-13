# Task Management System

A modern, scalable task management solution built with enterprise-grade technologies. This application demonstrates contemporary web development practices with a focus on:

- **Performance**: Optimized for speed and efficiency
- **Scalability**: Built to grow with your needs
- **Maintainability**: Clean, well-structured codebase
- **User Experience**: Intuitive design and smooth interactions

Built using React, TypeScript, Node.js and Next.js, this project serves as a reference implementation of frontend and backend development best practices.


watch it live here: https://parent-lab-test.vercel.app/

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn || yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

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



## Project Overview

This project is a Next.js application that uses Firebase Firestore as its database solution. It implements [brief description of your app's main functionality].

## Technical Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Node.js - Next.js Api
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: [Your styling solution, e.g., Tailwind CSS]
- **Deployment**: Vercel

## Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/diegoruelasgalaviz/parent-lab-test.git
cd parent-lab-test
```

2. **Environment Variables**
Create a `.env.local` file in the root directory with the following variables:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. **Install dependencies and run**
```bash
npm install
npm run dev
```

How PR and Commits are submitted: 

Here is an example of how a PR and commits are submitted, using conventional commits and proper PR descriptions:
https://github.com/diegoruelasgalaviz/parent-lab-test/pull/1

## Technical Decisions 🛠️

### Why Firestore? 🔥

We chose Firestore as our database solution because it's a perfect fit for our current needs and future growth. Here's why:

- ⚡ **Real-time Updates**: Get instant data syncs without extra configuration
- 📈 **Scalability**: Grows with your app automatically - no infrastructure headaches
- 💰 **Cost-effective**: Only pay for what you use
- 🔌 **Easy Integration**: Works seamlessly with other Firebase tools

### Architecture Choices 🏗️

- 🚀 **Server Components**: Using Next.js 14's latest features for better performance and SEO
- 🔄 **Smart Data Fetching**: Mix of server-side and client-side fetching for optimal speed
- 🔒 **Security First**: Robust Firestore security rules to keep data safe

## Trade-offs We Considered ⚖️

### Firestore: The Good and The Not-So-Good

#### What We Love 💚
- Development is much faster
- Real-time updates work out of the box
- Scales automatically as we grow
- Powerful querying capabilities

#### Challenges We're Aware Of 🤔
- Complex queries aren't as flexible as SQL, altough we can still use BigQuery for that
- Costs might increase with heavy usage
- Need to plan data structure carefully (NoSQL style)

### Performance Optimizations 🏃‍♂️

We've implemented several optimizations to keep things running smoothly:
- Smart pagination for large data sets
- Carefully structured collections for quick access
- Strategic indexing for faster queries

## Best Practices We Follow 📝

- Batch operations for multiple updates
- Thorough error handling
- Strong authentication practices
- Regular data backups

## Our Approach to Building This 🎯

### System Design 🏗️

We've built this with growth in mind:
- **Future-Ready Structure**: Easy to split into microservices later
- **Event-Driven**: Real-time updates where it matters
- **API-First**: Clean interfaces for future expansion

### Scaling Strategy 📈

1. **Database Setup**
   - Built for easy scaling
   - Smart indexing for speed
   - Future-proof data structure

2. **Performance Boosters**
   - Real-time subscriptions
   - Next.js server components
   - Efficient data fetching with SWR

### Project Organization 📁
```
src/
├── app/            # Next.js App Router directory
│   ├── modules/    # Modules easy to refactore and more SOLID and DRY like
│   └── tasks/      # Main app features
├── pages/          # Pages directory
│   └── api/        # API routes handled in Node.js and Typescript
├── lib/            # DatabaseManager only for now, will potentially be more.
└── components/     # Shared components
```

### Testing Plans 🧪

We plan to use:
- Unit tests with Jest
- Integration tests with Playwright
- Performance monitoring already implemented with Vercel and firebase.

### Future-Proofing 🔮

1. **External Services**
   - Firestore
   - Vercel


2. **Mobile Experience**
   - Responsive design
   - PWA ready
   - Mobile-friendly API

3. **Monitoring**
   - Error tracking
   - Performance metrics
   - Usage analytics

We're building this to last, with a focus on maintainability and scalability! 🚀

## Test Parent Lab 🧪

This project includes a comprehensive test for parent lab to validate skill to full stack development

The project its based of a pdf delivered to me with instructions on how to build this and how do i expect it
to be if it build overtime to have thousands of users and collaboration from other teams thats why i picked 
the architecture i did to keep it readable and fast


### Key Features
- Nodejs Endpoints
- Modular Code structure
- Configurable test parameters
- Real-time monitoring capabilities
- Detailed reporting and analytics
