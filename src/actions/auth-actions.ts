"use server";

import bcrypt from "bcryptjs";
import { UserRepository } from "@/lib/core/repositories";
import { redirect } from "next/navigation";
import { handleActionError } from "@/lib/shared/errors/error-handler";
import { authSchemas } from "@/lib/shared/schemas";
import type { RegistrationInput } from "@/lib/shared/types";

export interface RegistrationResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function registerUser(
  input: RegistrationInput
): Promise<RegistrationResult> {
  try {
    const validatedInput = authSchemas.registration.parse(input);

    const userRepository = new UserRepository();
    const existingUser = await userRepository.findByEmail(validatedInput.email);
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(validatedInput.password, 12);

    const userData = {
      name: validatedInput.name,
      email: validatedInput.email,
      password: hashedPassword,
      subscription: "HOBBY", // Default to hobby plan
    };

    await userRepository.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });
  } catch (error) {
    const result = handleActionError(error);
    return {
      success: false,
      message: result.message,
      error: result.message,
    };
  }

  redirect("/auth/signin");
}
