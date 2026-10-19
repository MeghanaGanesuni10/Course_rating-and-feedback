import User from '../models/User.js';
import Course from '../models/Course.js';
import Feedback from '../models/Feedback.js';

// GET /api/admin/analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const [totalStudents, totalAdmins, totalCourses, totalFeedback, ratingDist, topCourses, recentUsers] =
      await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'admin' }),
        Course.countDocuments(),
        Feedback.countDocuments(),
        Feedback.aggregate([
          { $group: { _id: '$overallRating', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Course.find().sort({ averageRating: -1, reviewCount: -1 }).limit(5).select('title courseCode averageRating reviewCount'),
        User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      ]);

    const avgRating =
      totalFeedback > 0
        ? await Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$overallRating' } } }]).then(
            (r) => (r[0]?.avg ? Math.round(r[0].avg * 10) / 10 : 0)
          )
        : 0;

    // Departments count
    const departments = await Course.distinct('department');

    res.status(200).json({
      stats: { totalStudents, totalAdmins, totalCourses, totalFeedback, avgRating, totalDepartments: departments.length },
      ratingDistribution: ratingDist,
      topCourses,
      recentUsers,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/recent-feedback
export const getRecentFeedback = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const feedback = await Feedback.find()
      .populate('student', 'name email')
      .populate('course', 'title courseCode')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({ feedback });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/all-feedback  — paginated list of ALL feedback
export const getAllFeedback = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, courseId, minRating, maxRating, sort = '-createdAt' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = {};

    if (courseId) query.course = courseId;
    if (minRating) query.overallRating = { ...query.overallRating, $gte: Number(minRating) };
    if (maxRating) query.overallRating = { ...query.overallRating, $lte: Number(maxRating) };

    const sortOptions = {
      '-createdAt': { createdAt: -1 },
      'createdAt': { createdAt: 1 },
      '-overallRating': { overallRating: -1 },
      'overallRating': { overallRating: 1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const [feedback, total] = await Promise.all([
      Feedback.find(query)
        .populate('student', 'name email studentId')
        .populate('course', 'title courseCode department instructor')
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit)),
      Feedback.countDocuments(query),
    ]);

    res.status(200).json({
      feedback,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/feedback/:id  — admin delete any feedback
export const adminDeleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });

    await Feedback.findOneAndDelete({ _id: req.params.id }); // triggers post hook for recalc
    res.status(200).json({ message: 'Feedback deleted by admin.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    // Get feedback count for each user
    const userIds = users.map(u => u._id);
    const feedbackCounts = await Feedback.aggregate([
      { $match: { student: { $in: userIds } } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(feedbackCounts.map(f => [f._id.toString(), f.count]));

    const usersWithStats = users.map(u => ({
      ...u.toJSON(),
      feedbackCount: countMap[u._id.toString()] || 0,
    }));

    res.status(200).json({ users: usersWithStats, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/promote  — promote student to admin
export const promoteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ user, message: `${user.name} promoted to admin.` });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id/demote  — demote admin to student
export const demoteUser = async (req, res, next) => {
  try {
    // Prevent self-demotion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot demote yourself.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'student' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ user, message: `${user.name} demoted to student.` });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id  — delete user and their feedback
export const deleteUser = async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Delete all feedback by this user
    const feedbacks = await Feedback.find({ student: user._id });
    for (const fb of feedbacks) {
      await Feedback.findOneAndDelete({ _id: fb._id }); // triggers recalc hooks
    }

    await User.findByIdAndDelete(user._id);
    res.status(200).json({ message: `User ${user.name} and their ${feedbacks.length} feedback(s) deleted.` });
  } catch (err) {
    next(err);
  }
};
