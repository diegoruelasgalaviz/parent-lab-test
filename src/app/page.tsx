import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to ParentLab Task Management System</h1>
        
        <p className="text-lg mb-8">
          This task management system is designed to demonstrate modern web development practices,
          focusing on scalability, maintainability, and user experience. Built with React, TypeScript,
          and Next.js, it showcases best practices in frontend development.
        </p>

        <div className="flex gap-4 items-center">
          <a
            href="/tasks"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-lg h-12 px-8"
          >
            Get Started →
          </a>
        </div>
      </main>
      
      <footer className="row-start-3 text-sm text-gray-500">
        <p>ParentLab Technical Exercise - Task Management System</p>
      </footer>
    </div>
  );
}
