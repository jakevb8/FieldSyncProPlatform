import { Router } from "express";
import { requireAuth } from "../middleware/firebaseAuth.js";
import { UsersService } from "../services/usersService.js";

const router = Router();
router.use(requireAuth);

// GET /v1/users/me — returns (or creates) the current user's profile
router.get("/me", async (req, res, next) => {
  try {
    const user = await UsersService.getOrCreate(
      req.user!.uid,
      req.user!.email ?? "",
      req.user!.name ?? null,
      req.user!.picture ?? null
    );
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
