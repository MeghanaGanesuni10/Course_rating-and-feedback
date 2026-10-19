import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title must be at most 120 characters'],
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9\-]+$/, 'Course code may only contain letters, numbers, and hyphens'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description must be at most 1000 characters'],
    },
    credits: {
      type: Number,
      min: [1, 'Credits must be at least 1'],
      max: [6, 'Credits must be at most 6'],
      default: 3,
    },
    semester: {
      type: String,
      trim: true,
      default: null,
    },
    // Denormalized stats — updated whenever feedback is written
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Note: courseCode uniqueness index is already created by unique:true in schema
courseSchema.index({ department: 1 });
courseSchema.index({ title: 'text', courseCode: 'text', department: 'text', instructor: 'text' });

const Course = mongoose.model('Course', courseSchema);
export default Course;
