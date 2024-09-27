/*
  Warnings:

  - You are about to drop the column `statusId` on the `Course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_statusId_fkey`;

-- AlterTable
ALTER TABLE `Course` DROP COLUMN `statusId`,
    ADD COLUMN `statusName` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_statusName_fkey` FOREIGN KEY (`statusName`) REFERENCES `Status`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;
