import Feedback from '../models/Feedback.js';
import Course from '../models/Course.js';

// POST /api/feedback
export const createFeedback = async (req, res, next) => {
  try {
    const { courseId, overallRating, teachingQuality, difficulty, learningResources, workload, review } = req.body;

    if (!courseId || !overallRating || !review) {
      return res.status(400).json({ message: 'courseId, overallRating and review are required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    // Duplicate check (unique index will also catch this, but give a friendly message)
    const existing = await Feedback.findOne({ student: req.user._id, course: courseId });
    if (existing) {
      return res.status(409).json({ message: 'You have already submitted feedback for this course.' });
    }

    const feedback = await Feedback.create({
      student: req.user._id,
      course: courseId,
      overallRating: Number(overallRating),
      teachingQuality: teachingQuality ? Number(teachingQuality) : null,
      difficulty: difficulty ? Number(difficulty) : null,
      learningResources: learningResources ? Number(learningResources) : null,
      workload: workload ? Number(workload) : null,
      review: review.trim(),
    });

    await feedback.populate('student', 'name');
    await feedback.populate('course', 'title courseCode');

    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
};

// GET /api/feedback/course/:courseId
export const getCourseFeedback = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [feedback, total] = await Promise.all([
      Feedback.find({ course: req.params.courseId })
        .populate('student', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Feedback.countDocuments({ course: req.params.courseId }),
    ]);

    res.status(200).json({
      feedback,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/feedback/mine
export const getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ student: req.user._id })
      .populate('course', 'title courseCode department instructor')
      .sort({ createdAt: -1 });

    res.status(200).json({ feedback });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/feedback/:id (owner only)
export const updateFeedback = async (req, res, next) => {
  try {
    const existing = await Feedback.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Feedback not found.' });

    if (existing.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own feedback.' });
    }

    const allowed = ['overallRating', 'teachingQuality', 'difficulty', 'learningResources', 'workload', 'review'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        existing[field] = field === 'review' ? req.body[field].trim() : Number(req.body[field]);
      }
    });

    await existing.save(); // triggers post('save') hook → recalcCourseStats
    await existing.populate('student', 'name');
    await existing.populate('course', 'title courseCode');

    res.status(200).json({ feedback: existing });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/feedback/:id (owner or admin)
export const deleteFeedback = async (req, res, next) => {
  try {
    const existing = await Feedback.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Feedback not found.' });

    if (existing.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own feedback.' });
    }

    await Feedback.findOneAndDelete({ _id: req.params.id }); // triggers post hook
    res.status(200).json({ message: 'Feedback deleted.' });
  } catch (err) {
    next(err);
  }
};
