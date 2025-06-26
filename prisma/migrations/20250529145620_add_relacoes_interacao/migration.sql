/*
  Warnings:

  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Interacao` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Interacao" DROP CONSTRAINT "Interacao_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Interacao" DROP CONSTRAINT "Interacao_jogoId_fkey";

-- AlterTable
ALTER TABLE "estudios" ALTER COLUMN "nome" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "jogos" ALTER COLUMN "titulo" SET DATA TYPE TEXT,
ALTER COLUMN "anoLancamento" SET DATA TYPE INTEGER,
ALTER COLUMN "genero" DROP DEFAULT,
ALTER COLUMN "destaque" SET DEFAULT true;

-- DropTable
DROP TABLE "Cliente";

-- DropTable
DROP TABLE "Interacao";

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "codigoRecuperacao" TEXT,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacoes" (
    "id" SERIAL NOT NULL,
    "mensagem" TEXT NOT NULL,
    "nota" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "jogoId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- AddForeignKey
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "jogos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
