import mongoose from "mongoose";

const ExportEventSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    infraIds: [{ type: String }],
    format: { type: String },
  },
  { _id: false }
);

const ExportLogSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    events: { type: [ExportEventSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("ExportLog", ExportLogSchema);
