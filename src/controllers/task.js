// module imports
const asyncHandler = require('express-async-handler');
const joi = require('joi');
const mongoose = require('mongoose');

// file imports
const TaskModel = require('../models/task');
const UserModel = require('../models/user');
const ErrorResponse = require('../utils/error-response');


// @desc   Get Tasks
// @route  GET /api/v1/tasks
// @access Private
exports.getAllTasks = asyncHandler(async (req, res, next) => {
  const { limit: l, page: p, sort: s, search: q, searchKey, lat, lng, radius } = req.query;
  const limit = l ? parseInt(l) : 10;
  const page = p ? parseInt(p) : 1;
  const sort = s || -1;
  const search = q || null;


  const query = [
    {
      $match: { createdBy: new mongoose.Types.ObjectId(req.user._id) }
    },
    {
      $lookup: {
        from: UserModel.collection.name,
        foreignField: '_id',
        localField: 'createdBy',
        as: 'createdBy',
      },
    },
    {
      $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        title: 1,
        description: 1,
        dueDate: 1,
        priority: 1,
        location: 1,
        createdBy: {
          _id: 1,
          name: 1,
          email: 1
        },
      }
    }
  ];

  if (lat && lng) {
    query.unshift({
      $geoNear: {
        near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        distanceField: "distance",
        spherical: true,
        key: 'location',
        maxDistance: parseFloat(radius) || 5000,
        minDistance: 0
      }
    });
  }

  const aggregate = TaskModel.aggregate(query);

  if (search) aggregate.match({ [searchKey || 'title']: { $regex: `.*${search}.*`, $options: 'i' } });

  const data = await TaskModel.aggregatePaginate(aggregate, {
    page,
    limit,
    sort: { createdAt: sort },
  });


  if (data.docs.length === 0) return next(new ErrorResponse('No data found', 404));

  res.status(200).json(data);
});

// @desc   Get Task Details
// @route  GET /api/v1/task/:id
// @access Private
exports.getSingleTask = asyncHandler(async (req, res, next) => {
  const task = await TaskModel.findOne({ _id: req.params.id, createdBy: new mongoose.Types.ObjectId(req.user._id) }).populate('createdBy', '-__v -password -createdAt -updatedAt');
  if (!task) return next(new ErrorResponse('No record found', 404));

  res.status(200).json(task);
});

// @desc   Add Task
// @route  POST /api/v1/task
// @access Private
exports.addTask = asyncHandler(async (req, res, next) => {
  const schema = joi.object({
    lat: joi.number().required(),
    lng: joi.number().required(),
    title: joi.string().required(),
    description: joi.string(),
    priority: joi.string().valid('high', 'medium', 'low').required(),
    dueDate: joi.date().optional()
  })

  // validate data
  const { error, value } = schema.validate(req.body);

  // if error, return error
  if (error) {
    return next(new ErrorResponse(error.details[0].message, 400));
  }

  const task = await TaskModel.create({
    ...req.body,
    createdBy: req.user._id,
    location: { type: 'Point', coordinates: [value.lng, value.lat] },
  });

  try {
    await TaskModel.collection.createIndex({ location: '2dsphere' });
  } catch (e) {
    console.log(e);
  }

  if (!task) return next(new ErrorResponse('Something went wrong', 500));

  res.status(200).json(task);
});

