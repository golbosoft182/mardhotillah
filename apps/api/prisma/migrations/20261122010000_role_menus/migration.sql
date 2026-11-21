-- CreateRoleMenu
CREATE TABLE "role_menus" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "menus" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_menus_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "role_menus_role_key" ON "role_menus"("role");
