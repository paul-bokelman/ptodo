/*
  Warnings:

  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "timeEnd" TIMESTAMP(3),
ADD COLUMN     "timeStart" TIMESTAMP(3);

-- DropTable
DROP TABLE "Tag";
