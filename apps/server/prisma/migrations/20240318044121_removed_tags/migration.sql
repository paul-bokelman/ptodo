/*
  Warnings:

  - You are about to drop the `_TagToTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TagToTask" DROP CONSTRAINT "_TagToTask_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagToTask" DROP CONSTRAINT "_TagToTask_B_fkey";

-- DropTable
DROP TABLE "_TagToTask";
