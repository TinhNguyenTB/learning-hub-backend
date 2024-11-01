-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `Comment_parentId_fkey`;

-- AlterTable
ALTER TABLE `comment` MODIFY `parentId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
