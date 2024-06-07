const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// GET All Blog Posts
router.get('/', async (req, res) => {
    const blogs = await Blog.find().populate('user', 'username');
    res.json(blogs);
});

// GET Single Blog Post
router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('user', 'username');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
});

// Create New Blog Post
router.post('/', auth, upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const blog = new Blog({
        title,
        content,
        image: req.file ? req.file.path : '',
        user: req.user._id
    });
    await blog.save();
    res.status(201).json(blog);
});

// Update Existing Blog Post
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.user.toString() !== req.user._id) {
        return res.status(403).json({ message: 'Permission denied' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.image = req.file ? req.file.path : blog.image;
    await blog.save();
    res.json(blog);
});

// Delete Existing Blog Post
router.delete('/:id', auth, async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.user.toString() !== req.user._id) {
        return res.status(403).json({ message: 'Permission denied' });
    }

    await blog.remove();
    res.json({ message: 'Blog deleted' });
});

// Get Filtered List of Posts
router.get('/filter', async (req, res) => {
    const { title, author } = req.query;
    const query = {};
    if (title) query.title = new RegExp(title, 'i');
    if (author) {
        const user = await User.findOne({ username: new RegExp(author, 'i') });
        if (user) query.user = user._id;
    }
    const blogs = await Blog.find(query).populate('user', 'username');
    res.json(blogs);
});

module.exports = router;
