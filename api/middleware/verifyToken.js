import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Not Authenticated!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) {
      // Clear invalid token
      res.clearCookie("token");
      return res.status(403).json({ message: "Token is not Valid!" });
    }

    req.userId = payload.id;
    next()
  });
};

export const optionalVerifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return next();
  
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err) return next();
    req.userId = payload.id;
    next();
  });
};

export const verifyAgentToken = (req, res, next) => {
  const token = req.cookies?.agentToken;

  if (!token) return res.status(401).json({ message: "Agent not authenticated!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) {
      res.clearCookie("agentToken");
      return res.status(403).json({ message: "Invalid agent token!" });
    }

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: payload.id },
    });

    if (!agent) {
      res.clearCookie("agentToken");
      return res.status(403).json({ message: "Agent account not found!" });
    }

    req.agentId = payload.id;
    next();
  });
};