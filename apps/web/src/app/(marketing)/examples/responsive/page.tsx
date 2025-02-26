/**
 * Example page showcasing responsive design with Tailwind CSS
 * Demonstrates mobile-first approach, dark mode, and component patterns
 */

import Image from "next/image";
import Link from "next/link";
import { ResponsiveCardGrid } from "@/components/examples/responsive-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ResponsiveExamplesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Responsive Design Examples
          </h1>
          <p className="max-w-[42rem] text-muted-foreground text-sm sm:text-base md:text-lg">
            This page demonstrates responsive design techniques using Tailwind CSS,
            including mobile-first approach, dark mode support, and reusable component patterns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button asChild size="lg">
              <Link href="/docs/tailwind-guide.md">View Documentation</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Responsive Cards</h2>
        <ResponsiveCardGrid />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Responsive Grid Layout</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="p-4 flex flex-col items-center">
              <div className="size-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold">{item}</span>
              </div>
              <h3 className="font-medium">Grid Item {item}</h3>
              <p className="text-sm text-muted-foreground text-center mt-2">
                This item adapts to the grid layout at different breakpoints
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Responsive Flex Layout</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-secondary/20 p-6 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Left Content</h3>
            <p className="text-muted-foreground">
              On mobile, this content stacks vertically. On larger screens, it displays in a row.
            </p>
          </div>
          <div className="flex-1 bg-secondary/20 p-6 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Right Content</h3>
            <p className="text-muted-foreground">
              This demonstrates how flex direction changes based on screen size.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Responsive Typography</h2>
        <div className="space-y-6 border p-6 rounded-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold">
            Headline 1
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Headline 2
          </h2>
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">
            Headline 3
          </h3>
          <p className="text-sm sm:text-base md:text-lg">
            Paragraph text that scales across different device sizes.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Small text that remains legible across breakpoints.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Responsive Image</h2>
        <div className="bg-secondary/20 p-4 rounded-lg">
          <div className="relative rounded-lg overflow-hidden aspect-video sm:aspect-[16/9] md:aspect-[21/9]">
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary">
              {/* Replace with actual image */}
              <p className="font-medium">Responsive Image Placeholder</p>
            </div>
          </div>
          <p className="text-center text-sm mt-2 text-muted-foreground">
            This image container maintains different aspect ratios at different breakpoints.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Dark Mode Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-background border dark:bg-secondary/10">
            <h3 className="font-medium mb-2">Dark Mode Card 1</h3>
            <p className="text-muted-foreground">
              This card uses semantic color tokens that adapt to dark mode.
            </p>
            <div className="mt-4 p-3 rounded bg-primary/10 dark:bg-primary/20">
              <p className="text-sm">Nested element with dark mode styles</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-white dark:bg-zinc-800 border">
            <h3 className="font-medium mb-2 text-black dark:text-white">Dark Mode Card 2</h3>
            <p className="text-gray-600 dark:text-gray-300">
              This card uses explicit dark mode variants for colors.
            </p>
            <div className="mt-4 p-3 rounded bg-gray-100 dark:bg-zinc-700">
              <p className="text-sm text-gray-800 dark:text-gray-200">Nested element with explicit dark mode</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
} 