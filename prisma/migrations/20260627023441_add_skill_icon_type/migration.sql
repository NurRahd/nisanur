-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "iconImage" TEXT,
ADD COLUMN     "iconType" TEXT NOT NULL DEFAULT 'lucide',
ALTER COLUMN "iconName" DROP NOT NULL;
