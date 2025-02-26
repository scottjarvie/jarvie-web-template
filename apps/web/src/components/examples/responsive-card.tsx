"use client";

import Image from "next/image";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResponsiveCardProps {
  title: string;
  description: string;
  imageSrc: string;
  tags: string[];
  actionText?: string;
  onAction?: () => void;
}

export function ResponsiveCard({
  title,
  description,
  imageSrc,
  tags,
  actionText = "View Details",
  onAction,
}: ResponsiveCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      {/* Mobile-first layout - stack elements vertically by default */}
      <div className="relative h-48 sm:h-56 md:h-64 w-full">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          priority
        />
      </div>
      
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <CardTitle className="text-xl sm:text-2xl line-clamp-2">{title}</CardTitle>
          <CardDescription className="line-clamp-2 sm:line-clamp-3">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardFooter className="p-4 sm:p-6 pt-0 flex justify-between items-center">
        <Button 
          onClick={onAction} 
          className="w-full sm:w-auto"
        >
          {actionText}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Usage example component
export function ResponsiveCardGrid() {
  const cards = [
    {
      title: "Building Mobile-First Experiences",
      description: "Learn how to design and develop responsive applications that provide an optimal experience across all devices.",
      imageSrc: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=870&auto=format&fit=crop",
      tags: ["Mobile", "Responsive", "Design"],
    },
    {
      title: "Harnessing Tailwind CSS with shadcn/ui",
      description: "Combine the flexibility of Tailwind with the structure of shadcn/ui components for rapid development.",
      imageSrc: "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?q=80&w=464&auto=format&fit=crop",
      tags: ["Tailwind", "shadcn/ui", "Components"],
    },
    {
      title: "Implementing Dark Mode with Next.js",
      description: "Create seamless dark mode experiences that respect user preferences and improve accessibility.",
      imageSrc: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=870&auto=format&fit=crop",
      tags: ["Dark Mode", "Next.js", "Accessibility"],
    },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Responsive UI Examples</h2>
      
      {/* Responsive grid that adapts to different screen sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <ResponsiveCard 
            key={index}
            {...card}
            onAction={() => console.log(`Card ${index + 1} clicked`)}
          />
        ))}
      </div>
    </div>
  );
} 