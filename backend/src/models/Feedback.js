import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    overallRating: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    teachingQuality: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    learningResources: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    workload: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: String,
      required: [true, 'Written review is required'],
      trim: true,
      minlength: [20, 'Review must be at least 20 characters'],
      maxlength: [2000, 'Review must be at most 2000 characters'],
    },
  },
  { timestamps: true }
);

// One feedback per student per course
feedbackSchema.index({ student: 1, course: 1 }, { unique: true });
feedbackSchema.index({ course: 1 });
feedbackSchema.index({ student: 1 });

// ── Recalculate course stats after save / delete ───────────────────────────────
async function recalcCourseStats(courseId) {
  const Course = mongoose.model('Course');
  const stats = await mongoose.model('Feedback').aggregate([
    { $match: { course: courseId } },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$overallRating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, { averageRating: 0, reviewCount: 0 });
  }
}

feedbackSchema.post('save', async function () {
  await recalcCourseStats(this.course);
});

feedbackSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await recalcCourseStats(doc.course);
});

feedbackSchema.post('findOneAndUpdate', async function (doc) {
  if (doc) await recalcCourseStats(doc.course);
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
