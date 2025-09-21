"use server";

import bcrypt from "bcryptjs";
import { UserRepository } from "@/lib/core/repositories";
import { authSchemas } from "@/lib/shared/schemas";
import { createActionWithRedirect } from "@/lib/shared/utils/action-factory";
import type { RegistrationInput } from "@/lib/shared/types";

export const registerUser = createActionWithRedirect(
  authSchemas.registration,
  async (input: RegistrationInput) => {
    const userRepository = new UserRepository();
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });
  },
  "/auth/signin"
);
