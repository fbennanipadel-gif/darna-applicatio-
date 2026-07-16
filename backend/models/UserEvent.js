import mongoose from 'mongoose';

/**
 * Lightweight behavioural signal used by the recommendation engine.
 * type: 'view' | 'favorite' | 'unfavorite' | 'visit' | 'review' | 'search'
 * We keep the restaurant's city + categories denormalised so recommendations
 * can be computed without a second lookup.
 */
const userEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', index: true },
    type: { type: String, required: true, index: true },
    city: String,
    categories: [String],
    weight: { type: Number, default: 1 },
  },
  { timestamps: true }
);

userEventSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('UserEvent', userEventSchema);
