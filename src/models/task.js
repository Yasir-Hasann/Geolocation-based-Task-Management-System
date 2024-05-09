// module imports
const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const TaskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date },
        priority: { type: String, enum: ['high', 'medium', 'low'] },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
            },
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    },
    {
        timestamps: true
    }
);

TaskSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('task', TaskSchema);