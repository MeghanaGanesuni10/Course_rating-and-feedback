import Course from '../models/Course.js';
import Feedback from '../models/Feedback.js';

// GET /api/courses
export const getCourses = async (req, res, next) => {
  try {
    const { search, department, minRating, sort = 'title', page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) query.department = { $regex: department, $options: 'i' };
    if (minRating) query.averageRating = { $gte: Number(minRating) };

    const sortOptions = {
      title: { title: 1 },
      '-title': { title: -1 },
      rating: { averageRating: -1 },
      '-rating': { averageRating: 1 },
      newest: { createdAt: -1 },
    };
    const sortBy = sortOptions[sort] || { title: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [courses, total] = await Promise.all([
      Course.find(query).sort(sortBy).skip(skip).limit(Number(limit)),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      courses,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/:id
export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.status(200).json({ course });
  } catch (err) {
    next(err);
  }
};

// POST /api/courses (admin only)
export const createCourse = async (req, res, next) => {
  try {
    const { title, courseCode, department, instructor, description, credits, semester } = req.body;

    if (!title || !courseCode || !department || !instructor || !description) {
      return res.status(400).json({ message: 'Title, courseCode, department, instructor and description are required.' });
    }

    const course = await Course.create({
      title: title.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      department: department.trim(),
      instructor: instructor.trim(),
      description: description.trim(),
      credits: credits || 3,
      semester: semester?.trim() || null,
    });

    res.status(201).json({ course });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/courses/:id (admin only)
export const updateCourse = async (req, res, next) => {
  try {
    const { title, courseCode, department, instructor, description, credits, semester } = req.body;
    const updates = {};
    if (title) updates.title = title.trim();
    if (courseCode) updates.courseCode = courseCode.trim().toUpperCase();
    if (department) updates.department = department.trim();
    if (instructor) updates.instructor = instructor.trim();
    if (description) updates.description = description.trim();
    if (credits) updates.credits = credits;
    if (semester !== undefined) updates.semester = semester?.trim() || null;

    const course = await Course.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.status(200).json({ course });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/courses/:id (admin only)
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    // Remove associated feedback
    await Feedback.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(course._id);

    res.status(200).json({ message: 'Course and its feedback deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/departments (unique list)
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Course.distinct('department');
    res.status(200).json({ departments: departments.sort() });
  } catch (err) {
    next(err);
  }
};
