import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1500 },
    // Optional link to an NFC-verified visit. When present, the review earns a "verified" badge.
    verifiedVisit: { type: mongoose.Schema.Types.ObjectId, ref: 'VerifiedVisit' },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
  },
  { timestamps: true }
);

// One review per user per restaurant (they can edit it).
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
