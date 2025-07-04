import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const updatePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const body = req.body;

  try {
    const post = await prisma.post.findUnique({ 
      where: { id },
      include: { postDetail: true }
    });

    // Check ownership
    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    // Save price history only if price changed
    if (body.price && body.price !== post.price) {
      await prisma.priceHistory.create({
        data: {
          postId: id,
          price: post.price,
          date: new Date(),
        },
      });
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        price: body.price,
        images: body.images,
        address: body.address,
        city: body.city,
        bedroom: parseInt(body.bedroom),
        bathroom: parseInt(body.bathroom),
        latitude: body.latitude,
        longitude: body.longitude,
        type: body.type,
        property: body.property,
      },
    });

    // Update post details
    if (body.postDetail) {
      await prisma.postDetail.update({
        where: { id: post.postDetail.id },
        data: {
          desc: body.postDetail.desc,
          utilities: body.postDetail.utilities,
          pet: body.postDetail.pet,
          income: body.postDetail.income,
          size: parseInt(body.postDetail.size),
          school: parseInt(body.postDetail.school),
          bus: parseInt(body.postDetail.bus),
          restaurant: parseInt(body.postDetail.restaurant),
        },
      });
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const getPriceHistory = async (req, res) => {
  const id = req.params.id;

  try {
    const history = await prisma.priceHistory.findMany({
      where: { postId: id },
      orderBy: { date: "desc" },
    });
    res.status(200).json(history);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get price history" });
  }
};

export const getPosts = async (req, res) => {
  const query = req.query;
  const tokenUserId = req.userId || null;

  try {
    const where = {
      city: query.city || undefined,
      type: query.type || undefined,
      property: query.property || undefined,
      bedroom: query.bedroom ? parseInt(query.bedroom) : undefined,
      price: {
        gte: query.minPrice ? parseInt(query.minPrice) : undefined,
        lte: query.maxPrice ? parseInt(query.maxPrice) : undefined,
      },
    };
    const includeOptions = tokenUserId
      ? {
          savedPosts: {
            where: { userId: tokenUserId },
            select: { id: true },
          },
        }
      : {};

    const posts = await prisma.post.findMany({
      where,
      include: includeOptions,
    });

    const postsWithSavedFlag = posts.map((post) => {
      const isSaved = tokenUserId
        ? post.savedPosts?.length > 0 || false
        : false;

      // Remove savedPosts from response
      const { savedPosts, ...postData } = post;
      return { ...postData, isSaved };
    });

    // setTimeout(() => {
    res.status(200).json(postsWithSavedFlag);
    // }, 3000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            displayName: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          res.status(200).json({ ...post, isSaved: saved ? true : false });
        }
      });
    }
    res.status(200).json({ ...post, isSaved: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

// export const updatePost = async (req, res) => {
//   try {
//     res.status(200).json();
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Failed to update posts" });
//   }
// };

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
      const post = await prisma.post.findUnique({
          where: { id },
          include: { postDetail: true } // Include related postDetail
      });
      if (post.userId != tokenUserId) {
          return res.status(403).json({ message: "Not Authorized!" });
      }

      // First delete related records
      if (post.postDetail) {
          await prisma.postDetail.delete({
              where: { id: post.postDetail.id }
          });
      }

      // Then delete the post
      await prisma.post.delete({
          where: { id },
      });
      res.status(200).json({ message: "Post deleted" });
  } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to delete post" });
  }
};
