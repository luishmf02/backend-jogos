/*
  Warnings:

  - You are about to drop the `carros` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fotos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marcas` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('ACAO', 'AVENTURA', 'RPG', 'ESTRATEGIA', 'SIMULACAO', 'ESPORTE', 'CORRIDA', 'TERROR');

-- DropForeignKey
ALTER TABLE "carros" DROP CONSTRAINT "carros_marcaId_fkey";

-- DropForeignKey
ALTER TABLE "fotos" DROP CONSTRAINT "fotos_carroId_fkey";

-- DropTable
DROP TABLE "carros";

-- DropTable
DROP TABLE "fotos";

-- DropTable
DROP TABLE "marcas";

-- DropEnum
DROP TYPE "Combustiveis";

-- CreateTable
CREATE TABLE "estudios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "estudios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jogos" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "anoLancamento" SMALLINT NOT NULL,
    "descricao" TEXT,
    "genero" "Genero" NOT NULL DEFAULT 'ACAO',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "capa" TEXT NOT NULL,
    "estudioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagens" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "legenda" VARCHAR(100) NOT NULL,
    "jogoId" INTEGER NOT NULL,

    CONSTRAINT "imagens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_estudioId_fkey" FOREIGN KEY ("estudioId") REFERENCES "estudios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagens" ADD CONSTRAINT "imagens_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "jogos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
