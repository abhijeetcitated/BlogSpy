import { NextRequest, NextResponse } from "next/server"

// Mock user database
const mockUsers = [
  {
    id: "user_1",
    email: "demo@blogspy.io",
    password: "demo123",
    name: "Demo User",
    avatar: "/avatars/demo.png",
    plan: "pro",
    credits: 500,
  },
]

// Mock JWT token generator
function generateMockToken(userId: string): string {
  return `mock_token_${userId}_${Date.now()}`
}

// POST /api/auth - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name } = body

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    switch (action) {
      case "login": {
        const user = mockUsers.find(
          (u) => u.email === email && u.password === password
        )

        if (!user) {
          return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
          )
        }

        const token = generateMockToken(user.id)

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            plan: user.plan,
            credits: user.credits,
          },
          token,
        })
      }

      case "register": {
        const existingUser = mockUsers.find((u) => u.email === email)

        if (existingUser) {
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 400 }
          )
        }

        const newUser = {
          id: `user_${Date.now()}`,
          email,
          password,
          name: name || email.split("@")[0],
          avatar: "/avatars/default.png",
          plan: "free",
          credits: 100,
        }

        // In real app, save to database
        // mockUsers.push(newUser)

        const token = generateMockToken(newUser.id)

        return NextResponse.json({
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            avatar: newUser.avatar,
            plan: newUser.plan,
            credits: newUser.credits,
          },
          token,
        })
      }

      case "forgot-password": {
        const user = mockUsers.find((u) => u.email === email)

        // Always return success to prevent email enumeration
        return NextResponse.json({
          success: true,
          message: "If an account exists, a reset link has been sent.",
        })
      }

      case "logout": {
        return NextResponse.json({
          success: true,
          message: "Logged out successfully",
        })
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Auth API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/auth - Get current user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer mock_token_")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Mock: Return demo user
    const demoUser = mockUsers[0]

    return NextResponse.json({
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        avatar: demoUser.avatar,
        plan: demoUser.plan,
        credits: demoUser.credits,
      },
    })
  } catch (error) {
    console.error("Auth API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
