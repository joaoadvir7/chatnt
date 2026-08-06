-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AutomationNodeType" ADD VALUE 'HTTP_REQUEST';
ALTER TYPE "AutomationNodeType" ADD VALUE 'OPT_OUT';
ALTER TYPE "AutomationNodeType" ADD VALUE 'RANDOMIZER';
ALTER TYPE "AutomationNodeType" ADD VALUE 'FORWARD_AUTOMATION';

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "optedOut" BOOLEAN NOT NULL DEFAULT false;
