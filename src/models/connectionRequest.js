const mongoose = require("mongoose");

const CONNECTION_STATUSES = ["ignored", "interested", "accepted", "rejected"];

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    pairKey: { type: String, select: false },
    status: {
      type: String,
      required: true,
      enum: { values: CONNECTION_STATUSES, message: "Unsupported connection status." },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.pairKey;
        delete ret.__v;
        return ret;
      },
    },
  }
);

connectionRequestSchema.pre("validate", function validateConnection() {
  if (!this.fromUserId || !this.toUserId) return;
  if (this.fromUserId.equals(this.toUserId)) {
    this.invalidate("toUserId", "You cannot create a connection interaction with yourself.");
    return;
  }
  const ids = [this.fromUserId.toString(), this.toUserId.toString()].sort();
  this.pairKey = ids.join(":");
});

connectionRequestSchema.index({ pairKey: 1 }, { unique: true, sparse: true });
connectionRequestSchema.index({ toUserId: 1, status: 1 });
connectionRequestSchema.index({ fromUserId: 1, status: 1 });

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
