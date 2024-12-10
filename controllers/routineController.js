"use strict";

const pubsub = require("../config/googleCloud");
const Routine = require("../models/routineModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const ERROR_MESSAGES = {
  userNotFound: "User not found.",
  productNotFound: "Product not found.",
  invalidParameters: "User ID, Product ID, and Category are required.",
  routineExists: "Routine already exists.",
  noRoutinesFound: "No routines found for the user.",
  skinTypeMismatch: (userSkin, productSkin) =>
    `Skin type mismatch: Product skin type is "${productSkin}" but user's skin type is "${userSkin}".`,
  categoryMismatch: (category) =>
    `Product does not match the provided category "${category}".`,
};

const validateUserAndProduct = async (user_id, product_id) => {
  const [user, product] = await Promise.all([
    User.findUserById(user_id),
    Product.findProductById(product_id),
  ]);

  if (!user) throw new Error(ERROR_MESSAGES.userNotFound);
  if (!product) throw new Error(ERROR_MESSAGES.productNotFound);
  return { user, product };
};

// Generic routine addition handler
const addRoutine = async (req, res, routineType) => {
  const { user_id, category, product_id } = req.params;

  if (!user_id || !product_id || !category) {
    return res.status(400).json({ message: ERROR_MESSAGES.invalidParameters });
  }

  try {
    const { user, product } = await validateUserAndProduct(user_id, product_id);

    if (user.skin_type !== product.skin_type) {
      return res.status(400).json({
        message: ERROR_MESSAGES.skinTypeMismatch(
          user.skin_type,
          product.skin_type
        ),
      });
    }

    if (product.category !== category) {
      return res.status(400).json({
        message: ERROR_MESSAGES.categoryMismatch(category),
      });
    }

    const findRoutineMethod =
      routineType === "day"
        ? Routine.findDayRoutineByUserAndProduct
        : Routine.findNightRoutineByUserAndProduct;

    const existingRoutine = await findRoutineMethod(user_id, product_id);
    if (existingRoutine) {
      return res.status(400).json({ message: ERROR_MESSAGES.routineExists });
    }

    const addRoutineMethod =
      routineType === "day"
        ? Routine.addDayRoutine
        : Routine.addNightRoutine;

    await addRoutineMethod(user_id, product_id, category);
    res.json({ message: `${routineType} Routine added successfully`, product });
  } catch (error) {
    console.error(`Error adding ${routineType} routine:`, error);
    res.status(500).json({ message: "Error adding routine" });
  }
};

// Handler implementations
exports.DayRoutine = (req, res) => addRoutine(req, res, "day");
exports.NightRoutine = (req, res) => addRoutine(req, res, "night");

// Generic routine deletion handler
const deleteRoutine = async (req, res, routineType) => {
  const { user_id } = req.params;

  try {
    const user = await User.findUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.userNotFound });
    }

    const getRoutinesMethod =
      routineType === "day"
        ? Routine.getDayRoutinesByUserId
        : Routine.getNightRoutinesByUserId;

    const routines = await getRoutinesMethod(user_id);
    if (!routines || routines.length === 0) {
      return res.status(404).json({ message: ERROR_MESSAGES.noRoutinesFound });
    }

    const message = {
      user_id,
      action: `${routineType}`,
      routines: routines.map((routine) => ({
        product_name: routine.name_product,
        category: routine.category,
      })),
    };

    const dataBuffer = Buffer.from(JSON.stringify(message));
    await pubsub.topic("routine-deleted-topic").publish(dataBuffer);

    const deleteRoutinesMethod =
      routineType === "Day"
        ? Routine.deleteDayRoutinesByUserId
        : Routine.deleteNightRoutinesByUserId;

    await deleteRoutinesMethod(user_id);

    res.status(202).json({
      message: `${routineType.charAt(0).toUpperCase()}${routineType.slice(
        1
      )} Routine Deleted Successfully`,
    });
  } catch (error) {
    console.error(`Error deleting ${routineType} routine:`, error);
    res.status(500).json({ message: "Error deleting routine" });
  }
};

// Handler implementations
exports.DeleteDayRoutine = (req, res) => deleteRoutine(req, res, "day");
exports.DeleteNightRoutine = (req, res) => deleteRoutine(req, res, "night");

// Generic routine fetching handler
const fetchRoutines = async (req, res, routineType) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: ERROR_MESSAGES.invalidParameters });
  }

  try {
    const getRoutinesMethod =
      routineType === "day"
        ? Routine.getDayRoutinesByUserId
        : Routine.getNightRoutinesByUserId;

    const routines = await getRoutinesMethod(user_id);
    res.json({ routines });
  } catch (error) {
    console.error(`Error fetching ${routineType} routines:`, error);
    res.status(500).json({ message: `Error fetching ${routineType} routines` });
  }
};

// Handler implementations
exports.getUserDayRoutines = (req, res) => fetchRoutines(req, res, "day");
exports.getUserNightRoutines = (req, res) => fetchRoutines(req, res, "night");