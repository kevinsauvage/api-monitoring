import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { UserWithPassword, UserCreateInput } from "@/types/prisma";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password: userPassword } = await request.json();

    // Validate input
    if (!name || !email || !userPassword) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (userPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userPassword, 12);

    // Create user
    const userData: UserCreateInput = {
      name,
      email,
      password: hashedPassword,
      subscription: "HOBBY", // Default to hobby plan
    };

    const user = (await prisma.user.create({
      data: userData,
    })) as UserWithPassword;

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
