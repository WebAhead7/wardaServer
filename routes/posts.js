const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const Post = require('../models/Post');

// @route GET api/posts
// @desc Get all posts
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route POST api/posts
// @desc Add new post
// @access Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;

    try {
      const newPost = new Post({ user: req.user.id, title, content });

      const post = await newPost.save();

      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route PUT api/posts/:id
// @desc Update post
// @access Private
router.put('/:id', auth, async (req, res) => {
  const { title, content } = req.body;

  const postFields = {};
  if (title) postFields.title = title;
  if (content) postFields.content = content;

  try {
    let post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: postFields },
      { new: true }
    );

    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route DELETE api/posts/:id
// @desc Delete post
// @access Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Post.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Post removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
