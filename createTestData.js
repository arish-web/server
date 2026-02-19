const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 🔹 1. Get existing course
  const course = await prisma.course.findFirst();

  if (!course) {
    console.log("No course found.");
    return;
  }

  // 🔹 2. Create module
  const module = await prisma.module.create({
    data: {
      title: "Introduction Module",
      courseId: course.id,
      tenantId: course.tenantId,
    },
  });

  // 🔹 3. Create lesson (QUIZ type)
  const lesson = await prisma.lesson.create({
    data: {
      title: "Quiz Lesson",
      type: "QUIZ",
      moduleId: module.id,
      tenantId: course.tenantId,
    },
  });

  // 🔹 4. Create quiz
  const quiz = await prisma.quiz.create({
    data: {
      lessonId: lesson.id,
      tenantId: course.tenantId,
    },
  });

  // 🔹 5. Create question
  await prisma.question.create({
    data: {
      questionText: "What is 2 + 2?",
      options: ["1", "2", "3", "4"],
      correctAnswer: "4",
      quizId: quiz.id,
      tenantId: course.tenantId,
    },
  });

  console.log("Test quiz data created successfully");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
