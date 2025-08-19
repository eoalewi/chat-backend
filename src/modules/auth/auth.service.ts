import prisma from "../../config/db";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/token";

class AuthService {
  async register(email: string, username: string, password: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });

    // Generate JWT
    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid email or password");

    // Generate JWT
    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  }
}

export default new AuthService();
