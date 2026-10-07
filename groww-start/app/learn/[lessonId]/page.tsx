import { notFound } from "next/navigation";
import { LESSONS, getLesson } from "@/lib/content";
import { LessonPlayer } from "@/components/learn/lesson-player";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ lessonId: l.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
